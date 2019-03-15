from __future__ import absolute_import

import re
import logging
from django.db import transaction
from rest_framework.response import Response

from sentry.api.base import DocSection
from sentry.api.content_negotiation import ConditionalContentNegotiation
from sentry.api.exceptions import ResourceDoesNotExist
from sentry.api.paginator import OffsetPaginator
from sentry.api.serializers import serialize
from sentry.models import File, UserTask, UserTaskFile
from sentry.api.bases.user_task import UserTaskBaseEndpoint

ERR_FILE_EXISTS = 'A file matching this name already exists for the given UserTask'
_filename_re = re.compile(r"[\n\t\r\f\v\\]")


class UserTaskFilesEndpoint(UserTaskBaseEndpoint):
    doc_section = DocSection.USERTASK
    content_negotiation_class = ConditionalContentNegotiation

    def get(self, request, user_task_id):
        """
        List files in a UserTask
        ````````````````````````

        Example:

        curl --header "Authorization: Bearer $LIMS_TOKEN" \
                      "http://localhost:8000/api/0/user-tasks/1/files/"

        :pparam string user_task_id: the ID of the user task
        :auth: required
        """
        try:
            user_task = UserTask.objects.get(pk=user_task_id)
        except UserTask.DoesNotExist:
            raise ResourceDoesNotExist

        file_list = UserTaskFile.objects.filter(
            user_task=user_task,
        ).select_related('file', 'dist').order_by('name')

        return self.paginate(
            request=request,
            queryset=file_list,
            order_by='name',
            paginator_cls=OffsetPaginator,
            on_results=lambda x: serialize(x, request.user),
        )

    def post(self, request, user_task_id):
        """
        Upload a new file related to a UserTask
        ``````````````````````````````````````

        Upload a new file for the UserTask.

        Unlike other API requests, files must be uploaded using the
        traditional multipart/form-data content-type.

        Example:

        curl --header "Authorization: Bearer $LIMS_TOKEN" \
             -F "name=Makefile" \
             -F "file=@Makefile" \
             "http://localhost:8000/api/0/user-tasks/1/files/"

        :pparm string user_task_id: the id of the task
        :param string name: the name (full path) of the file.
        :param file file: the multipart encoded file.
        :param string header: this parameter can be supplied multiple times
                              to attach headers to the file.  Each header
                              is a string in the format ``key:value``.
                              It can be used to assign tags to the file with ``tags:a,b``.
        :auth: required
        """

        from sentry.models.user_task import UserTask

        try:
            user_task = UserTask.objects.get(pk=int(user_task_id))
        except UserTask.DoesNotExist:
            raise ResourceDoesNotExist

        logger = logging.getLogger('clims.files')
        logger.info('usertaskfile.start')

        if 'file' not in request.FILES:
            return Response({'detail': 'Missing uploaded file'}, status=400)

        fileobj = request.FILES['file']

        full_name = request.DATA.get('name', fileobj.name)
        if not full_name or full_name == 'file':
            return Response({'detail': 'File name must be specified'}, status=400)

        name = full_name.rsplit('/', 1)[-1]

        if _filename_re.search(name):
            return Response(
                {
                    'detail': 'File name must not contain special whitespace characters'
                }, status=400
            )

        headers = {
            'Content-Type': fileobj.content_type,
        }
        for headerval in request.DATA.getlist('header') or ():
            try:
                k, v = headerval.split(':', 1)
            except ValueError:
                return Response({'detail': 'header value was not formatted correctly'}, status=400)
            else:
                if _filename_re.search(v):
                    return Response(
                        {
                            'detail': 'header value must not contain special whitespace characters'
                        },
                        status=400
                    )
                headers[k] = v.strip()

        file = File.objects.create(
            name=name,
            type='user_task.file',
            headers=headers,
        )
        file.putfile(fileobj, logger=logger)

        try:
            with transaction.atomic():
                # TODO: Remove the organization id from the user task file
                user_task_file = UserTaskFile.objects.create(
                    organization_id=user_task.organization_id,
                    file=file,
                    name=full_name,
                    user_task_id=user_task.id
                )
        except IOError:
            file.delete()
            return Response({'detail': ERR_FILE_EXISTS}, status=409)

        return Response(serialize(user_task_file, request.user), status=201)
