

import logging

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from sentry.api.base import Endpoint, SessionAuthentication

delete_logger = logging.getLogger('sentry.deletions.api')
logger = logging.getLogger(__name__)


class UserFilesEndpoint(Endpoint):
    authentication_classes = (SessionAuthentication, )
    permission_classes = (IsAuthenticated, )

    def get(self, request):
        pass

    def post(self, request):
        content = request.data["content"]
        # file_name = request.data["fileName"]

        # TODO: Here we should implement the following:
        # 1. save the data to the database
        # 2. registered handlers (defined in plugins) should run on this data
        # 3. profit

        import io
        from sentry.plugins2 import file_handlers_registry

        content_bytes = content.decode('base64')
        f = io.BytesIO(content_bytes)
        file_handlers_registry.handle_file_uploaded(f)

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
