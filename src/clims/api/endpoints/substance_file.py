from __future__ import absolute_import

import StringIO
import base64

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import IntegrityError

from sentry.api.paginator import OffsetPaginator
from sentry.api.bases.organization import OrganizationEndpoint
from clims.services import FileNameValidationError
from clims.handlers import RequiredHandlerNotFound
from clims.api.serializers.models.organization_file import OrganizationFileSerializer
from clims.plugins import PluginError
from clims.api.serializers.models.plugin_error import PluginErrorSerializer
from clims.api.serializers.models.validation_issue import ValidationIssueSerializer


class SubstanceFileEndpoint(OrganizationEndpoint):
    permission_classes = (IsAuthenticated, )

    def get(self, request, organization):
        """
        List all substance submission files in the system
        `````````````````````````````````````````````````

        :pparam string organization_slug: the slug of the organization the
                                          release belongs to.
        :auth: required
        """
        file_list = self.app.substances.all_files(organization)

        return self.paginate(
            request=request,
            queryset=file_list,
            order_by='name',
            paginator_cls=OffsetPaginator,
            on_results=lambda x: OrganizationFileSerializer(x, many=True).data,
        )

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
        if 'content' not in request.data:
            return Response({'detail': 'Missing uploaded file'}, status=400)

        content = request.data['content']
        content = base64.b64decode(content)
        fileobj = StringIO.StringIO(content)
        full_name = request.data.get('filename')

        if not full_name or full_name == 'file':
            return Response({'detail': 'File name must be specified'}, status=400)

        try:
            org_file, issues = self.app.substances.load_file(organization, full_name, fileobj)
            issues_json = ValidationIssueSerializer(issues, many=True).data
            ret = dict(id=org_file.id, validationIssues=issues_json)
            return Response(ret, status=status.HTTP_201_CREATED)

        except RequiredHandlerNotFound:
            return Response({'detail':
                'No registered handler that supports the request. Please install a plugin that '
                'supports handling substance files.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except FileNameValidationError as ex:
            return Response({'detail': ex.msg}, status=400)
        except IntegrityError as ex:
            # TODO This error message is not always accurate. An IntegrityError will for example also be raised
            #      when there is a problem with adding the same sample to the organization again.
            return Response(
                {'detail': 'A file matching this one already exists in this organization'},
                status=409)
        except PluginError as e:
            serializer = PluginErrorSerializer(e)
            return Response(serializer.data, status=400)
