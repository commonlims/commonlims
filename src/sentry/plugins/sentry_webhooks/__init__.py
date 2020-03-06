

from sentry.plugins import register

from .plugin import WebHooksPlugin

register(WebHooksPlugin)
