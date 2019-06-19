from __future__ import absolute_import

from mock import patch
from hashlib import sha1

from django.core.urlresolvers import reverse
from django.core.files.base import ContentFile

from sentry.models import ApiToken, FileBlob, FileBlobIndex, FileBlobOwner
from sentry.models.file import ChunkFileState
from sentry.models.debugfile import get_assemble_status
from sentry.testutils import APITestCase
from sentry.tasks.assemble import assemble_dif, assemble_file


class DifAssembleEndpoint(APITestCase):
    def setUp(self):
        self.organization = self.create_organization(owner=self.user)
        self.token = ApiToken.objects.create(
            user=self.user,
            scope_list=['project:write'],
        )
        self.team = self.create_team(organization=self.organization)
        self.project = self.create_project(
            teams=[
                self.team],
            organization=self.organization,
            name='foo')
        self.url = reverse(
            'sentry-api-0-assemble-dif-files',
            args=[
                self.organization.slug,
                self.project.slug])

    def test_assemble_json_schema(self):
        response = self.client.post(
            self.url,
            data={
                'lol': 'test'
            },
            HTTP_AUTHORIZATION=u'Bearer {}'.format(self.token.token)
        )
        assert response.status_code == 400, response.content

        checksum = sha1('1').hexdigest()
        response = self.client.post(
            self.url,
            data={
                checksum: 'test'
            },
            HTTP_AUTHORIZATION=u'Bearer {}'.format(self.token.token)
        )
        assert response.status_code == 400, response.content

        response = self.client.post(
            self.url,
            data={
                checksum: {
                }
            },
            HTTP_AUTHORIZATION=u'Bearer {}'.format(self.token.token)
        )
        assert response.status_code == 400, response.content

        response = self.client.post(
            self.url,
            data={
                checksum: {
                    'name': 'dif',
                    'chunks': [],
                }
            },
            HTTP_AUTHORIZATION=u'Bearer {}'.format(self.token.token)
        )
        assert response.status_code == 200, response.content
        assert response.data[checksum]['state'] == ChunkFileState.NOT_FOUND

    @patch('sentry.tasks.assemble.assemble_dif')
    def test_assemble(self, mock_assemble_dif):
        content1 = 'foo'.encode('utf-8')
        fileobj1 = ContentFile(content1)
        checksum1 = sha1(content1).hexdigest()

        content2 = 'bar'.encode('utf-8')
        fileobj2 = ContentFile(content2)
        checksum2 = sha1(content2).hexdigest()

        content3 = 'baz'.encode('utf-8')
        fileobj3 = ContentFile(content3)
        checksum3 = sha1(content3).hexdigest()

        total_checksum = sha1(content2 + content1 + content3).hexdigest()

        # The order here is on purpose because we check for the order of checksums
        blob1 = FileBlob.from_file(fileobj1)
        FileBlobOwner.objects.get_or_create(
            organization=self.organization,
            blob=blob1
        )
        blob3 = FileBlob.from_file(fileobj3)
        FileBlobOwner.objects.get_or_create(
            organization=self.organization,
            blob=blob3
        )
        blob2 = FileBlob.from_file(fileobj2)

        # we make a request now but we are missing ownership for chunk 2
        response = self.client.post(
            self.url,
            data={
                total_checksum: {
                    'name': 'test',
                    'chunks': [
                        checksum2, checksum1, checksum3
                    ]
                }
            },
            HTTP_AUTHORIZATION=u'Bearer {}'.format(self.token.token)
        )
        assert response.status_code == 200, response.content
        assert response.data[total_checksum]['state'] == ChunkFileState.NOT_FOUND
        assert response.data[total_checksum]['missingChunks'] == [checksum2]

        # we add ownership to chunk 2
        FileBlobOwner.objects.get_or_create(
            organization=self.organization,
            blob=blob2
        )

        # new request, ownership for all chunks is there but file does not exist yet
        response = self.client.post(
            self.url,
            data={
                total_checksum: {
                    'name': 'test',
                    'chunks': [
                        checksum2, checksum1, checksum3
                    ],
                }
            },
            HTTP_AUTHORIZATION=u'Bearer {}'.format(self.token.token)
        )
        assert response.status_code == 200, response.content
        assert response.data[total_checksum]['state'] == ChunkFileState.CREATED
        assert response.data[total_checksum]['missingChunks'] == []

        chunks = [checksum2, checksum1, checksum3]
        mock_assemble_dif.apply_async.assert_called_once_with(
            kwargs={
                'project_id': self.project.id,
                'name': 'test',
                'chunks': chunks,
                'checksum': total_checksum,
            }
        )

        file = assemble_file(self.project, 'test', total_checksum, chunks, 'project.dif')[0]
        assert get_assemble_status(self.project, total_checksum)[0] != ChunkFileState.ERROR
        assert file.checksum == total_checksum

        file_blob_index = FileBlobIndex.objects.all()
        assert len(file_blob_index) == 3

    def test_dif_response(self):
        sym_file = self.load_fixture('crash.sym')
        blob1 = FileBlob.from_file(ContentFile(sym_file))
        total_checksum = sha1(sym_file).hexdigest()
        chunks = [blob1.checksum]

        assemble_dif(
            project_id=self.project.id,
            name='crash.sym',
            checksum=total_checksum,
            chunks=chunks,
        )

        response = self.client.post(
            self.url,
            data={
                total_checksum: {
                    'name': 'test.sym',
                    'chunks': chunks,
                }
            },
            HTTP_AUTHORIZATION=u'Bearer {}'.format(self.token.token)
        )

        assert response.status_code == 200, response.content
        assert response.data[total_checksum]['state'] == ChunkFileState.OK
        assert response.data[total_checksum]['dif']['cpuName'] == 'x86_64'
        assert response.data[total_checksum]['dif']['uuid'] == '67e9247c-814e-392b-a027-dbde6748fcbf'

    def test_dif_error_response(self):
        sym_file = 'fail'
        blob1 = FileBlob.from_file(ContentFile(sym_file))
        total_checksum = sha1(sym_file).hexdigest()
        chunks = [blob1.checksum]

        assemble_dif(
            project_id=self.project.id,
            name='test.sym',
            checksum=total_checksum,
            chunks=chunks,
        )

        response = self.client.post(
            self.url,
            data={
                total_checksum: {
                    'name': 'test.sym',
                    'chunks': [],
                }
            },
            HTTP_AUTHORIZATION=u'Bearer {}'.format(self.token.token)
        )

        assert response.status_code == 200, response.content
        assert response.data[total_checksum]['state'] == ChunkFileState.ERROR
        assert response.data[total_checksum]['detail'].startswith('Invalid debug information file')
