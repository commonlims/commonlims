from __future__ import absolute_import
import posixpath

from rest_framework import serializers
from rest_framework.response import Response

from sentry.api.base import DocSection
from clims.api.bases.work_batch import WorkBatchBaseEndpoint
from sentry.api.exceptions import ResourceDoesNotExist
from sentry.api.serializers import serialize
from clims.models import WorkBatch, WorkBatchFile
try:
    from django.http import (CompatibleStreamingHttpResponse as StreamingHttpResponse)
except ImportError:
    from django.http import StreamingHttpResponse


class WorkBatchFileSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200, required=True)


class WorkBatchFileDetailsEndpoint(WorkBatchBaseEndpoint):
    doc_section = DocSection.WORKBATCH

    def download(self, work_batch_file):
        file = work_batch_file.file
        fp = file.getfile()
        response = StreamingHttpResponse(
            iter(lambda: fp.read(4096), b''),
            content_type=file.headers.get('content-type', 'application/octet-stream'),
        )
        response['Content-Length'] = file.size
        response['Content-Disposition'] = 'attachment; filename="%s"' % posixpath.basename(
            " ".join(work_batch_file.name.split())
        )
        return response

    def get(self, request, work_batch_id, file_id):
        """
        Retrieves a file associated with a WorkBatch
        ```````````````````````````````````````

        Return details on an individual file within a user task.

        Example:
        curl --header "Authorization: Bearer $LIMS_TOKEN"
                      "http://localhost:8000/api/0/work-batches/1/files/11/?download=True"

        If you skip the download parameter, only the metadata will be returned.

        :pparam string work_batch_id: the user task id
        :pparam string file_id: the ID of the file to retrieve.
        :param string download: the ID of the file to retrieve.
        :auth: required
        """
        try:
            work_batch = WorkBatch.objects.get(pk=work_batch_id)
        except WorkBatch.DoesNotExist:
            raise ResourceDoesNotExist

        # TODO: specify the rights for downloading the file

        try:
            work_batch_file = WorkBatchFile.objects.get(work_batch=work_batch, id=file_id)
        except WorkBatchFile.DoesNotExist:
            raise ResourceDoesNotExist

        download_requested = request.GET.get('download') is not None
        if download_requested:
            return self.download(work_batch_file)
        return Response(serialize(work_batch_file, request.user))

    def put(self, request, file_id, work_batch_id):
        """
        Update a WorkBatch file
        `````````````````````````````````````

        Update metadata of an existing file.  Currently only the name of
        the file can be changed.

        Example:

        curl -X PUT --header "Content-Type: application/json" \
                    --data '{"name": "newname"}' \
                    --header "Authorization: Bearer $LIMS_TOKEN" \
                    "http://localhost:8000/api/0/work-batches/lims/1/files/1/"

        :pparam string file_id: the ID of the file to update.
        :param string name: the new name of the file.
        :auth: required
        """
        try:
            work_batch = WorkBatch.objects.get(pk=work_batch_id)
        except WorkBatch.DoesNotExist:
            raise ResourceDoesNotExist

        try:
            work_batch_file = WorkBatchFile.objects.get(work_batch=work_batch, id=file_id)
        except WorkBatchFile.DoesNotExist:
            raise ResourceDoesNotExist

        serializer = WorkBatchFileSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        result = serializer.validated_data

        work_batch_file.update(name=result['name'])

        return Response(serialize(work_batch_file, request.user))

    def delete(self, request, work_batch_id, file_id):
        """
        Delete an WorkBatch file
        ```````````````````````

        Permanently remove a file from a user task.

        This will also remove the physical file from storage.

        :pparam string file_id: the ID of the file to delete.
        :auth: required
        """
        try:
            work_batch = WorkBatch.objects.get(pk=work_batch_id)
        except WorkBatch.DoesNotExist:
            raise ResourceDoesNotExist

        try:
            work_batch_file = WorkBatchFile.objects.get(work_batch=work_batch, id=file_id)
        except WorkBatchFile.DoesNotExist:
            raise ResourceDoesNotExist

        file = work_batch_file.file

        # TODO(dcramer): this doesnt handle a failure from file.deletefile() to
        # the actual deletion of the db row
        work_batch_file.delete()
        file.delete()

        return Response(status=204)
