from __future__ import absolute_import

import logging

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from uuid import uuid4

from sentry.api.base import Endpoint, SessionAuthentication
from sentry.api.exceptions import ResourceDoesNotExist
from sentry.api.serializers import serialize
from sentry.models import ApiApplication, ApiApplicationStatus
from clims.models.sample import Sample
from sentry.tasks.deletion import delete_api_application

delete_logger = logging.getLogger('sentry.deletions.api')
logger = logging.getLogger(__name__)
from clims.workflow import WorkflowEngine


class UserFilesEndpoint(Endpoint):
    authentication_classes = (SessionAuthentication, )
    permission_classes = (IsAuthenticated, )

    def get(self, request):
        pass

    def post(self, request):
        content = request.DATA["content"]
        file_name = request.DATA["fileName"]

        # TODO: Here we should implement the following:
        # 1. save the data to the database
        # 2. registered handlers (defined in plugins) should run on this data
        # 3. profit

        # But for now (poc) we'll just use the snp&seq sample submission sheet handler
        import io
        content_bytes = content.decode('base64')
        f = io.BytesIO(content_bytes)

        submission_sheet = HandleSampleSubmissionSheet()
        submission_sheet.handle_file(f)

        return Response({}, status=201)


class UserFileDetailsEndpoint(Endpoint):
    authentication_classes = (SessionAuthentication, )
    permission_classes = (IsAuthenticated, )

    def get(self, request, user_file_id):
        pass

    def put(self, request, user_file_id):
        pass

    def delete(self, request, user_file_id):
        pass
