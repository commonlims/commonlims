from __future__ import absolute_import

import logging
import re
import StringIO

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import IntegrityError, transaction

from clims.models import OrganizationFile
from sentry.api.bases.organization import OrganizationEndpoint
from sentry.models import File
import base64

FILENAME_RE = re.compile(r"[\n\t\r\f\v\\]")


class SubstanceFileEndpoint(OrganizationEndpoint):
    permission_classes = (IsAuthenticated, )

    def get(self, request, organization):
        # TODO: and write test
        return Response({})

    def post(self, request, organization):
        """
        Upload a batch file of substances
        `````````````````````````````````

        Upload a file containing a batch of `substances` to be created.
        The most likely usage of this endpoint is to upload a batch of samples,
        e.g. a sample submission sheet from a customer.

        Unlike other API requests, files must be uploaded using the
        traditional multipart/form-data content-type.

        The optional 'name' attribute should reflect the absolute path
        that this file will be referenced as. For example, in the case of
        JavaScript you might specify the full web URI.

        :pparam string organization_slug: the slug of the organization the samples belong to
        :param string name: the name (full path) of the file.
        :param file file: the multipart encoded file.
        :param string header: this parameter can be supplied multiple times
                              to attach headers to the file.  Each header
                              is a string in the format ``key:value``.  For
                              instance it can be used to define a content
                              type.
        :auth: required
        """
        from sentry.plugins import plugins
        from clims.handlers import SubstancesSubmissionHandler, HandlerContext
        submission_handlers = plugins.handlers[SubstancesSubmissionHandler]
        if len(submission_handlers) == 0:
            return Response({'detail':
                'No registered handler that supports the request. Please install a plugin that '
                'supports handling substance files.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        logger = logging.getLogger('clims.files')
        logger.info('substance_batch_import.start')

        if 'content' not in request.data:
            return Response({'detail': 'Missing uploaded file'}, status=400)
        content = request.data['content']
        content = base64.b64decode(content)
        fileobj = StringIO.StringIO(content)
        full_name = request.data.get('filename')
        if not full_name or full_name == 'file':
            return Response({'detail': 'File name must be specified'}, status=400)
        name = full_name.rsplit('/', 1)[-1]
        if FILENAME_RE.search(name):
            return Response(
                {
                    'detail': 'File name must not contain special whitespace characters'
                }, status=400
            )

        file_model = File.objects.create(
            name=name,
            type='substance-batch-file',
            headers=list(),
        )
        file_model.putfile(fileobj, logger=logger)

        try:
            # NOTE: This behaviour comes from Sentry. I don't know why they
            # delete the file afterwards rather than having everything within the same
            # transaction
            with transaction.atomic():
                org_file = OrganizationFile.objects.create(
                    organization_id=organization.id,
                    file=file_model,
                    name=full_name,
                )

            ret = dict(id=org_file.id)

            # Call handler synchronously:
            for handler in submission_handlers:
                context = HandlerContext(organization=organization)
                instance = handler(context)
                instance.handle(org_file)

            return Response(ret, status=status.HTTP_201_CREATED)
        except IntegrityError:
            file_model.delete()
            return Response(
                {'detail': 'A file matching this name already exists in this organization'},
                status=409)
