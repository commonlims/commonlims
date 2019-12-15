# -*- coding: utf-8 -*-

from __future__ import absolute_import

import pytest

from exam import fixture

from sentry.exceptions import PluginError
from sentry.plugins.sentry_webhooks.plugin import validate_urls, WebHooksPlugin, WebHooksOptionsForm
from sentry.testutils import TestCase


class WebHooksPluginTest(TestCase):
    @fixture
    def plugin(self):
        return WebHooksPlugin()

    def test_webhook_validation(self):
        # Test that you can't sneak a bad domain into the list of webhooks
        # without it being validated by delmiting with \r instead of \n
        bad_urls = 'http://example.com\rftp://baddomain.com'
        form = WebHooksOptionsForm(data={'urls': bad_urls})
        form.is_valid()

        with pytest.raises(PluginError):
            validate_urls(form.cleaned_data.get('urls'))
