

import re
import logging
from django.db import transaction
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser

from sentry.api.base import DocSection
from sentry.api.content_negotiation import ConditionalContentNegotiation
from sentry.api.exceptions import ResourceDoesNotExist
from sentry.api.paginator import OffsetPaginator
from sentry.api.serializers import serialize
from sentry.models import File
from clims.models import WorkBatch, WorkBatchFile
from clims.api.bases.work_batch import WorkBatchBaseEndpoint

ERR_FILE_EXISTS = 'A file matching this name already exists for the given WorkBatch'
_filename_re = re.compile(r"[\n\t\r\f\v\\]")


class WorkBatchFilesEndpoint(WorkBatchBaseEndpoint):
    doc_section = DocSection.WORKBATCH
    content_negotiation_class = ConditionalContentNegotiation
    parser_classes = (MultiPartParser,)

    def get(self, request, work_batch_id):
        """
        List files in a WorkBatch
        ````````````````````````

        Example:

        curl --header "Authorization: Bearer $LIMS_TOKEN" \
                      "http://localhost:8000/api/0/work-batches/1/files/"

        :pparam string work_batch_id: the ID of the user task
        :auth: required
        """
        try:
            work_batch = WorkBatch.objects.get(pk=work_batch_id)
        except WorkBatch.DoesNotExist:
            raise ResourceDoesNotExist

        file_list = WorkBatchFile.objects.filter(
            work_batch=work_batch,
        ).select_related('file', 'dist').order_by('name')

        return self.paginate(
            request=request,
            queryset=file_list,
            order_by='name',
            paginator_cls=OffsetPaginator,
            on_results=lambda x: serialize(x, request.user),
        )

    def post(self, request, work_batch_id):
        """
        Upload a new file related to a WorkBatch
        ``````````````````````````````````````

        Upload a new file for the WorkBatch.

        Unlike other API requests, files must be uploaded using the
        traditional multipart/form-data content-type.

        Example:

        curl --header "Authorization: Bearer $LIMS_TOKEN" \
             -F "name=Makefile" \
             -F "file=@Makefile" \
             "http://localhost:8000/api/0/work-batches/1/files/"

        :pparm string work_batch_id: the id of the task
        :param string name: the name (full path) of the file.
        :param file file: the multipart encoded file.
        :param string header: this parameter can be supplied multiple times
                              to attach headers to the file.  Each header
                              is a string in the format ``key:value``.
                              It can be used to assign tags to the file with ``tags:a,b``.
        :auth: required
        """

        from sentry.models.workbatch import WorkBatch

        try:
            work_batch = WorkBatch.objects.get(pk=int(work_batch_id))
        except WorkBatch.DoesNotExist:
            raise ResourceDoesNotExist

        logger = logging.getLogger('clims.files')
        logger.info('workbatchfile.start')

        if 'file' not in request.data:
            return Response({'detail': 'Missing uploaded file'}, status=400)

        fileobj = request.data['file']

        full_name = request.data.get('name', fileobj.name)
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
        for headerval in request.data.getlist('header') or ():
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
            type='work_batch.file',
            headers=headers,
        )
        file.putfile(fileobj, logger=logger)

        try:
            with transaction.atomic():
                # TODO: Remove the organization id from the user task file
                work_batch_file = WorkBatchFile.objects.create(
                    organization_id=work_batch.organization_id,
                    file=file,
                    name=full_name,
                    work_batch_id=work_batch.id
                )
        except IOError:
            file.delete()
            return Response({'detail': ERR_FILE_EXISTS}, status=409)

        return Response(serialize(work_batch_file, request.user), status=201)
