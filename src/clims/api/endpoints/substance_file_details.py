from __future__ import absolute_import

import posixpath

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from sentry.api.bases.organization import OrganizationEndpoint
from sentry.api.exceptions import ResourceDoesNotExist
from clims.services import NotFound
from clims.api.serializers.models.organization_file import OrganizationFileSerializer
try:
    from django.http import (CompatibleStreamingHttpResponse as StreamingHttpResponse)
except ImportError:
    from django.http import StreamingHttpResponse


class SubstanceFileDetailsEndpoint(OrganizationEndpoint):
    permission_classes = (IsAuthenticated, )

    def download(self, fp, name, size, content_type='application/octet-stream'):
        response = StreamingHttpResponse(
            iter(lambda: fp.read(4096), b''),
            content_type=content_type
        )
        response['Content-Length'] = size
        response['Content-Disposition'] = 'attachment; filename="%s"' % posixpath.basename(
            " ".join(name.split())
        )
        return response

    def download_from_model(self, model):
        file = model.file
        fp = file.getfile()
        size = file.size
        name = model.name
        content_type = 'application/octet-stream'
        # TODO: file.headers is an empty list now, not a dictionary(?) We should use the header
        # content_type=file.headers.get('content-type', 'application/octet-stream'),
        return self.download(fp, name, size, content_type)

    def get(self, request, organization, file_id):
        """
        Retrieve a single SubstanceSubmissionFile
        ```````````````````````````````````````

        Return details on an individual file within a release.  This does
        not actually return the contents of the file, just the associated
        metadata.

        :pparam string organization_slug: the slug of the organization the
                                          release belongs to.
        :pparam string file_id: the ID of the file to retrieve.
        :auth: required
        """

        try:
            submission_file = self.app.substances.get_submission_file(file_id)
        except NotFound:
            raise ResourceDoesNotExist

        download_requested = request.GET.get('download') is not None
        if download_requested:
            return self.download_from_model(submission_file)
        elif download_requested:
            return Response(status=403)
        return Response(OrganizationFileSerializer(submission_file).data)


class SubstanceFileDemoDetailsEndpoint(SubstanceFileDetailsEndpoint):
    def get(self, request, organization):
        file_type = request.GET.get('file_type', 'default')
        fp, name, size = self.app.substances.create_submission_demo(file_type)
        return self.download(fp, name, size)
