

from django.utils.crypto import constant_time_compare
from rest_framework.authentication import (BasicAuthentication, get_authorization_header)
from rest_framework.exceptions import AuthenticationFailed

from sentry.relay.utils import get_header_relay_id, get_header_relay_signature
from sentry.utils.sdk import configure_scope

import semaphore


class QuietBasicAuthentication(BasicAuthentication):
    def authenticate_header(self, request):
        return 'xBasic realm="%s"' % self.www_authenticate_realm


class StandardAuthentication(QuietBasicAuthentication):
    token_name = None

    def authenticate(self, request):
        auth = get_authorization_header(request).split()

        if not auth or auth[0].lower() != self.token_name:
            return None

        if len(auth) == 1:
            msg = 'Invalid token header. No credentials provided.'
            raise AuthenticationFailed(msg)
        elif len(auth) > 2:
            msg = 'Invalid token header. Token string should not contain spaces.'
            raise AuthenticationFailed(msg)

        return self.authenticate_credentials(auth[1])


class RelayAuthentication(BasicAuthentication):
    def authenticate(self, request):
        relay_id = get_header_relay_id(request)
        relay_sig = get_header_relay_signature(request)
        if not relay_id:
            raise AuthenticationFailed('Invalid relay ID')
        if not relay_sig:
            raise AuthenticationFailed('Missing relay signature')
        return self.authenticate_credentials(relay_id, relay_sig, request)

    def authenticate_credentials(self, relay_id, relay_sig, request):
        from django.contrib.auth.models import AnonymousUser  # Django 1.9 setup issue
        from sentry.models import Relay  # Django 1.9 setup issue
        with configure_scope() as scope:
            scope.set_tag('relay_id', relay_id)

        try:
            relay = Relay.objects.get(relay_id=relay_id)
        except Relay.DoesNotExist:
            raise AuthenticationFailed('Unknown relay')

        try:
            data = relay.public_key_object.unpack(request.body, relay_sig,
                                                  max_age=60 * 5)
            request.relay = relay
            request.relay_request_data = data
        except semaphore.UnpackError:
            raise AuthenticationFailed('Invalid relay signature')

        # TODO(mitsuhiko): can we return the relay here?  would be nice if we
        # could find some common interface for it
        return (AnonymousUser(), None)


class ApiKeyAuthentication(QuietBasicAuthentication):
    def authenticate_credentials(self, userid, password):
        from django.contrib.auth.models import AnonymousUser  # Django 1.9 setup issue
        from sentry.models import ApiKey  # Django 1.9 setup issue
        if password:
            return None

        try:
            key = ApiKey.objects.get_from_cache(key=userid)
        except ApiKey.DoesNotExist:
            raise AuthenticationFailed('API key is not valid')

        if not key.is_active:
            raise AuthenticationFailed('Key is disabled')

        with configure_scope() as scope:
            scope.set_tag("api_key", key.id)

        return (AnonymousUser(), key)


class ClientIdSecretAuthentication(QuietBasicAuthentication):
    """
    Authenticates a Sentry Application using its Client ID and Secret

    This will be the method by which we identify which Sentry Application is
    making the request, for any requests not scoped to an installation.

    For example, the request to exchange a Grant Code for an Api Token.
    """

    def authenticate(self, request):
        from sentry.models import ApiApplication  # Django 1.9 setup issue
        if not request.json_body:
            raise AuthenticationFailed('Invalid request')

        client_id = request.json_body.get('client_id')
        client_secret = request.json_body.get('client_secret')

        invalid_pair_error = AuthenticationFailed('Invalid Client ID / Secret pair')

        if not client_id or not client_secret:
            raise invalid_pair_error

        try:
            application = ApiApplication.objects.get(client_id=client_id)
        except ApiApplication.DoesNotExist:
            raise invalid_pair_error

        if not constant_time_compare(application.client_secret, client_secret):
            raise invalid_pair_error

        try:
            return (application.sentry_app.proxy_user, None)
        except Exception:
            raise invalid_pair_error


class TokenAuthentication(StandardAuthentication):
    token_name = b'bearer'

    def authenticate_credentials(self, token):
        from sentry.models import ApiToken  # Django 1.9 setup issue
        try:
            token = ApiToken.objects.filter(
                token=token,
            ).select_related('user', 'application').get()
        except ApiToken.DoesNotExist:
            raise AuthenticationFailed('Invalid token')

        if token.is_expired():
            raise AuthenticationFailed('Token expired')

        if not token.user.is_active:
            raise AuthenticationFailed('User inactive or deleted')

        if token.application and not token.application.is_active:
            raise AuthenticationFailed('UserApplication inactive or deleted')

        with configure_scope() as scope:
            scope.set_tag("api_token_type", self.token_name)
            scope.set_tag("api_token", token.id)

        return (token.user, token)


class DSNAuthentication(StandardAuthentication):
    token_name = b'dsn'

    def authenticate_credentials(self, token):
        from django.contrib.auth.models import AnonymousUser  # Django 1.9 setup issue
        from sentry.models import ProjectKey  # Django 1.9 setup issue
        try:
            key = ProjectKey.from_dsn(token)
        except ProjectKey.DoesNotExist:
            raise AuthenticationFailed('Invalid token')

        if not key.is_active:
            raise AuthenticationFailed('Invalid token')

        with configure_scope() as scope:
            scope.set_tag("api_token_type", self.token_name)
            scope.set_tag("api_project_key", key.id)

        return (AnonymousUser(), key)
