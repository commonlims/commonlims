

import six

from rest_framework.response import Response

import requests
from sentry.utils.dates import parse_stats_period
from sentry.search.utils import InvalidQuery, parse_query
from sentry.api.bases.organization import OrganizationEndpoint
from django.conf import settings


# Typing for the Camunda API to support additional features (in particular simpler date filtering)
CAMUNDA_API_META = {
    "task": {
        "get": {
            "dueDate": {"type": "date"},
            "dueAfter": {"type": "date"},
            "dueBefore": {"type": "date"},
            "followUpDate": {"type": "date"},
            "followUpAfter": {"type": "date"},
            "followUpBefore": {"type": "date"},
            "followUpBeforeOrNotExistent": {"type": "date"},
            "createdOn": {"type": "date"},
            "createdAfter": {"type": "date"},
            "createdBefore": {"type": "date"}
        }
    }
}


class WorkflowEndpoint(OrganizationEndpoint):
    """
    Acts as a proxy endpoint for endpoints in Camunda.

    WARNING: The Camunda API does not throw an error if you send incorrect parameters to it,
    so if you filter for e.g. "asignee" instead of "assignee", the filter will simply be ignored.
    """

    # TODO: Take organizations into account on Camunda's end
    # TODO: Paging. Camunda expects firstResult and maxResults
    # TODO: Frontend should sort using sortBy, sortOrder
    # TODO: review auth

    def _url(self, endpoint):
        return settings.CAMUNDA_API_URL + "/" + endpoint

    def _get_param_meta(self, endpoint, method, param):
        try:
            return CAMUNDA_API_META[endpoint][method][param]
        except KeyError:
            return None

    def _params_to_camunda(self, endpoint, method, params):
        """
        Edits the supplied parameter making sure that they work for Camunda's API interface
        """
        _params = dict()
        for param in params:
            _params[param] = params[param]
        params = _params

        if "limit" in params:
            params["maxResults"] = params["limit"]
            del params["limit"]

        # We support date parameters that allow for syntax -7d etc (supported in
        # Sentry). Such parameters
        for param in params:
            meta_info = self._get_param_meta(endpoint, method, param)
            if meta_info and meta_info["type"] == "date":
                params[param] = parse_stats_period(params[param])
        return params

    def _get_search_query_and_tags(self, request):
        raw_query = request.GET.get('query')

        if raw_query:
            query_kwargs = parse_query(raw_query, request.user)
            query = query_kwargs.pop('query', None)
            tags = query_kwargs.pop('tags', {})
        else:
            query = None
            tags = {}
        return query, tags

    def get(self, request, organization, workflow_endpoint):
        # TODO: Translate from our paging semantics to camunda's
        # TODO: Translate error codes

        # TODO: Do we allow searching with the 'query' here
        try:
            query, tags = self._get_search_query_and_tags(request)
        except InvalidQuery as exc:
            return Response({'detail': six.text_type(exc)}, status=400)

        camunda_params = self._params_to_camunda(workflow_endpoint, "get", tags)
        response = requests.get(self._url(workflow_endpoint), params=camunda_params)
        return Response(response.json())

    def post(self, request):
        raise NotImplementedError()

    def put(self, request):
        raise NotImplementedError()
