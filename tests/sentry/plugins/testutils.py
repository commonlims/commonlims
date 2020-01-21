from __future__ import absolute_import

from clims.services import ioc
from sentry.plugins import IssueTrackingPlugin2


class VstsPlugin(IssueTrackingPlugin2):
    slug = 'vsts'
    name = 'VSTS Mock Plugin'
    conf_key = slug


class GitHubPlugin(IssueTrackingPlugin2):
    slug = 'github'
    name = 'GitHub Mock Plugin'
    conf_key = slug


class BitbucketPlugin(IssueTrackingPlugin2):
    slug = 'bitbucket'
    name = 'Bitbucket Mock Plugin'
    conf_key = slug


def unregister_mock_plugins():
    ioc.app.plugins.unregister(VstsPlugin)
    ioc.app.plugins.unregister(GitHubPlugin)
    ioc.app.plugins.unregister(BitbucketPlugin)


def register_mock_plugins():
    ioc.app.plugins.register(VstsPlugin)
    ioc.app.plugins.register(GitHubPlugin)
    ioc.app.plugins.register(BitbucketPlugin)
