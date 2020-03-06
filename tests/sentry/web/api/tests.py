# -*- coding: utf-8 -*-

from __future__ import absolute_import

import mock

from django.core.urlresolvers import reverse
from exam import fixture

from sentry.coreapi import APIRateLimited
from sentry.testutils import TestCase
from sentry.utils import json


class SecurityReportCspTest(TestCase):
    @fixture
    def path(self):
        path = reverse('sentry-api-security-report', kwargs={'project_id': self.project.id})
        return path + '?sentry_key=%s' % self.projectkey.public_key

    def test_get_response(self):
        resp = self.client.get(self.path)
        assert resp.status_code == 405, resp.content

    def test_invalid_content_type(self):
        resp = self.client.post(self.path, content_type='text/plain')
        assert resp.status_code == 400, resp.content

    def test_missing_csp_report(self):
        resp = self.client.post(
            self.path,
            content_type='application/csp-report',
            data='{"lol":1}',
            HTTP_USER_AGENT='awesome',
        )
        assert resp.status_code == 400, resp.content

    @mock.patch('sentry.utils.http.get_origins')
    def test_bad_origin(self, get_origins):
        get_origins.return_value = ['example.com']
        resp = self.client.post(
            self.path,
            content_type='application/csp-report',
            data='{"csp-report":{"document-uri":"http://lolnope.com","effective-directive":"img-src","violated-directive":"img-src","source-file":"test.html"}}',
            HTTP_USER_AGENT='awesome',
        )
        assert resp.status_code == 403, resp.content

        get_origins.return_value = ['*']
        resp = self.client.post(
            self.path,
            content_type='application/csp-report',
            data='{"csp-report":{"document-uri":"about:blank"}}',
            HTTP_USER_AGENT='awesome',
        )
        assert resp.status_code == 400, resp.content

    @mock.patch('sentry.web.api.is_valid_origin', mock.Mock(return_value=True))
    @mock.patch('sentry.web.api.SecurityReportView.process')
    def test_post_success(self, process):
        process.return_value = 'ok'
        resp = self._postCspWithHeader(
            {
                'document-uri': 'http://example.com',
                'source-file': 'http://example.com',
                'effective-directive': 'style-src',
                'violated-directive': 'style-src',
                'disposition': 'enforce',
            }
        )
        assert resp.status_code == 201, resp.content


class SecurityReportHpkpTest(TestCase):
    @fixture
    def path(self):
        path = reverse('sentry-api-security-report', kwargs={'project_id': self.project.id})
        return path + '?sentry_key=%s' % self.projectkey.public_key

    @mock.patch('sentry.web.api.is_valid_origin', mock.Mock(return_value=True))
    @mock.patch('sentry.web.api.SecurityReportView.process')
    def test_post_success(self, process):
        process.return_value = 'ok'
        resp = self.client.post(
            self.path,
            content_type='application/json',
            data=json.dumps({
                "date-time": "2014-04-06T13:00:50Z",
                "hostname": "www.example.com",
                "port": 443,
                "effective-expiration-date": "2014-05-01T12:40:50Z",
                "include-subdomains": False,
                "served-certificate-chain": ["-----BEGIN CERTIFICATE-----\n-----END CERTIFICATE-----"],
                "validated-certificate-chain": ["-----BEGIN CERTIFICATE-----\n-----END CERTIFICATE-----"],
                "known-pins": ["pin-sha256=\"E9CZ9INDbd+2eRQozYqqbQ2yXLVKB9+xcprMF+44U1g=\""],
            }),
            HTTP_USER_AGENT='awesome',
        )
        assert resp.status_code == 201, resp.content


class SecurityReportExpectCTTest(TestCase):
    @fixture
    def path(self):
        path = reverse('sentry-api-security-report', kwargs={'project_id': self.project.id})
        return path + '?sentry_key=%s' % self.projectkey.public_key

    @mock.patch('sentry.web.api.is_valid_origin', mock.Mock(return_value=True))
    @mock.patch('sentry.web.api.SecurityReportView.process')
    def test_post_success(self, process):
        process.return_value = 'ok'
        resp = self.client.post(
            self.path,
            content_type='application/expect-ct-report+json',
            data=json.dumps({
                "expect-ct-report": {
                    "date-time": "2014-04-06T13:00:50Z",
                    "hostname": "www.example.com",
                    "port": 443,
                    "effective-expiration-date": "2014-05-01T12:40:50Z",
                    "served-certificate-chain": ["-----BEGIN CERTIFICATE-----\n-----END CERTIFICATE-----"],
                    "validated-certificate-chain": ["-----BEGIN CERTIFICATE-----\n-----END CERTIFICATE-----"],
                    "scts": [
                        {
                            "version": 1,
                            "status": "invalid",
                            "source": "embedded",
                            "serialized_sct": "ABCD=="
                        },
                    ],
                }
            }),
            HTTP_USER_AGENT='awesome',
        )
        assert resp.status_code == 201, resp.content


class SecurityReportExpectStapleTest(TestCase):
    @fixture
    def path(self):
        path = reverse('sentry-api-security-report', kwargs={'project_id': self.project.id})
        return path + '?sentry_key=%s' % self.projectkey.public_key

    @mock.patch('sentry.web.api.is_valid_origin', mock.Mock(return_value=True))
    @mock.patch('sentry.web.api.SecurityReportView.process')
    def test_post_success(self, process):
        process.return_value = 'ok'
        resp = self.client.post(
            self.path,
            content_type='application/expect-staple-report',
            data=json.dumps({
                "expect-staple-report": {
                    "date-time": "2014-04-06T13:00:50Z",
                    "hostname": "www.example.com",
                    "port": 443,
                    "response-status": "ERROR_RESPONSE",
                    "cert-status": "REVOKED",
                    "effective-expiration-date": "2014-05-01T12:40:50Z",
                    "served-certificate-chain": ["-----BEGIN CERTIFICATE-----\n-----END CERTIFICATE-----"],
                    "validated-certificate-chain": ["-----BEGIN CERTIFICATE-----\n-----END CERTIFICATE-----"],
                }
            }),
            HTTP_USER_AGENT='awesome',
        )
        assert resp.status_code == 201, resp.content


class CrossDomainXmlTest(TestCase):
    @fixture
    def path(self):
        return reverse('sentry-api-crossdomain-xml', kwargs={'project_id': self.project.id})

    @mock.patch('sentry.web.api.get_origins')
    def test_output_with_global(self, get_origins):
        get_origins.return_value = '*'
        resp = self.client.get(self.path)
        get_origins.assert_called_once_with(self.project)
        assert resp.status_code == 200, resp.content
        self.assertEqual(resp['Content-Type'], 'application/xml')
        self.assertTemplateUsed(resp, 'sentry/crossdomain.xml')
        assert '<allow-access-from domain="*" secure="false" />' in resp.content.decode('utf-8')

    @mock.patch('sentry.web.api.get_origins')
    def test_output_with_whitelist(self, get_origins):
        get_origins.return_value = ['disqus.com', 'www.disqus.com']
        resp = self.client.get(self.path)
        get_origins.assert_called_once_with(self.project)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp['Content-Type'], 'application/xml')
        self.assertTemplateUsed(resp, 'sentry/crossdomain.xml')
        assert '<allow-access-from domain="disqus.com" secure="false" />' in resp.content.decode(
            'utf-8'
        )
        assert '<allow-access-from domain="www.disqus.com" secure="false" />' in resp.content.decode(
            'utf-8'
        )

    @mock.patch('sentry.web.api.get_origins')
    def test_output_with_no_origins(self, get_origins):
        get_origins.return_value = []
        resp = self.client.get(self.path)
        get_origins.assert_called_once_with(self.project)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp['Content-Type'], 'application/xml')
        self.assertTemplateUsed(resp, 'sentry/crossdomain.xml')
        assert '<allow-access-from' not in resp.content.decode('utf-8')

    def test_output_allows_x_sentry_auth(self):
        resp = self.client.get(self.path)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp['Content-Type'], 'application/xml')
        self.assertTemplateUsed(resp, 'sentry/crossdomain.xml')
        assert '<allow-http-request-headers-from domain="*" headers="*" secure="false" />' in resp.content.decode(
            'utf-8'
        )


class RobotsTxtTest(TestCase):
    @fixture
    def path(self):
        return reverse('sentry-api-robots-txt')

    def test_robots(self):
        resp = self.client.get(self.path)
        assert resp.status_code == 200
        assert resp['Content-Type'] == 'text/plain'


def rate_limited_dispatch(*args, **kwargs):
    raise APIRateLimited(retry_after=42.42)


class APIViewTest(TestCase):
    @mock.patch('sentry.web.api.APIView._dispatch', new=rate_limited_dispatch)
    def test_retry_after_int(self):
        resp = self._postWithHeader({})
        assert resp['Retry-After'] == '43'
