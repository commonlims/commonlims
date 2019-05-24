from __future__ import absolute_import
import posixpath

from rest_framework import serializers
from rest_framework.response import Response

from sentry.api.base import DocSection
from clims.api.bases.user_task import UserTaskBaseEndpoint
from sentry.api.exceptions import ResourceDoesNotExist
from sentry.api.serializers import serialize
from clims.models import UserTask, UserTaskFile
try:
    from django.http import (CompatibleStreamingHttpResponse as StreamingHttpResponse)
except ImportError:
    from django.http import StreamingHttpResponse


class UserTaskFileSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200, required=True)


class UserTaskFileDetailsEndpoint(UserTaskBaseEndpoint):
    doc_section = DocSection.USERTASK

    def download(self, user_task_file):
        file = user_task_file.file
        fp = file.getfile()
        response = StreamingHttpResponse(
            iter(lambda: fp.read(4096), b''),
            content_type=file.headers.get('content-type', 'application/octet-stream'),
        )
        response['Content-Length'] = file.size
        response['Content-Disposition'] = 'attachment; filename="%s"' % posixpath.basename(
            " ".join(user_task_file.name.split())
        )
        return response

    def get(self, request, user_task_id, file_id):
        """
        Retrieves a UserTask file
        ```````````````````````````````````````

        Return details on an individual file within a user task.

        Example:
        curl --header "Authorization: Bearer $LIMS_TOKEN"
                      "http://localhost:8000/api/0/user-tasks/1/files/11/?download=True"

        If you skip the download parameter, only the metadata will be returned.

        :pparam string user_task_id: the user task id
        :pparam string file_id: the ID of the file to retrieve.
        :param string download: the ID of the file to retrieve.
        :auth: required
        """
        try:
            user_task = UserTask.objects.get(pk=user_task_id)
        except UserTask.DoesNotExist:
            raise ResourceDoesNotExist

        # TODO: specify the rights for downloading the file

        try:
            user_task_file = UserTaskFile.objects.get(user_task=user_task, id=file_id)
        except UserTaskFile.DoesNotExist:
            raise ResourceDoesNotExist

        download_requested = request.GET.get('download') is not None
        if download_requested:
            return self.download(user_task_file)
        return Response(serialize(user_task_file, request.user))

    def put(self, request, file_id, user_task_id):
        """
        Update UserTask file
        `````````````````````````````````````

        Update metadata of an existing file.  Currently only the name of
        the file can be changed.

        Example:

        curl -X PUT --header "Content-Type: application/json" \
                    --data '{"name": "newname"}' \
                    --header "Authorization: Bearer $LIMS_TOKEN" \
                    "http://localhost:8000/api/0/user-tasks/lims/1/files/1/"

        :pparam string file_id: the ID of the file to update.
        :param string name: the new name of the file.
        :auth: required
        """
        try:
            user_task = UserTask.objects.get(pk=user_task_id)
        except UserTask.DoesNotExist:
            raise ResourceDoesNotExist

        try:
            user_task_file = UserTaskFile.objects.get(user_task=user_task, id=file_id)
        except UserTaskFile.DoesNotExist:
            raise ResourceDoesNotExist

        serializer = UserTaskFileSerializer(data=request.DATA)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        result = serializer.object

        user_task_file.update(name=result['name'])

        return Response(serialize(user_task_file, request.user))

    def delete(self, request, user_task_id, file_id):
        """
        Delete an UserTask file
        ```````````````````````

        Permanently remove a file from a user task.

        This will also remove the physical file from storage.

        :pparam string file_id: the ID of the file to delete.
        :auth: required
        """
        try:
            user_task = UserTask.objects.get(pk=user_task_id)
        except UserTask.DoesNotExist:
            raise ResourceDoesNotExist

        try:
            user_task_file = UserTaskFile.objects.get(user_task=user_task, id=file_id)
        except UserTaskFile.DoesNotExist:
            raise ResourceDoesNotExist

        file = user_task_file.file

        # TODO(dcramer): this doesnt handle a failure from file.deletefile() to
        # the actual deletion of the db row
        user_task_file.delete()
        file.delete()

        return Response(status=204)
