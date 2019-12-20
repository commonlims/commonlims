# -*- coding: utf-8 -*-
"""
sentry.testutils.fixtures
~~~~~~~~~~~~~~~~~~~~~~~~~

:copyright: (c) 2010-2014 by the Sentry Team, see AUTHORS for more details.
:license: BSD, see LICENSE for more details.
"""
from __future__ import absolute_import, print_function, unicode_literals

import os
import petname
import random
import six
import warnings

from django.db import IntegrityError, transaction
from django.utils import timezone
from django.utils.text import slugify
from exam import fixture
from hashlib import sha1
from loremipsum import Generator
from uuid import uuid4

from sentry.constants import SentryAppStatus
from sentry.mediators import sentry_apps, sentry_app_installations, service_hooks
from sentry.models import (
    Activity, Environment, Group, Organization, OrganizationMember,
    OrganizationMemberTeam, Project, ProjectBookmark, Team, User, UserEmail, Release, Commit, ReleaseCommit,
    CommitAuthor, Repository, CommitFileChange, File, UserPermission, EventAttachment,
    UserReport
)
from clims.models import PluginRegistration

loremipsum = Generator()


def make_sentence(words=None):
    if words is None:
        words = int(random.weibullvariate(8, 3))
    return ' '.join(random.choice(loremipsum.words) for _ in range(words))


def make_word(words=None):
    if words is None:
        words = int(random.weibullvariate(8, 3))
    return random.choice(loremipsum.words)


class Fixtures(object):
    @fixture
    def projectkey(self):
        return self.create_project_key(project=self.project)

    @fixture
    def user(self):
        return self.create_user('admin@localhost', is_superuser=True)

    @fixture
    def organization(self):
        # XXX(dcramer): ensure that your org slug doesnt match your team slug
        # and the same for your project slug
        return self.create_organization(
            name='baz',
            slug='baz',
            owner=self.user,
        )

    @fixture
    def team(self):
        team = self.create_team(
            organization=self.organization,
            name='foo',
            slug='foo',
        )
        # XXX: handle legacy team fixture
        queryset = OrganizationMember.objects.filter(
            organization=self.organization,
        )
        for om in queryset:
            OrganizationMemberTeam.objects.create(
                team=team,
                organizationmember=om,
                is_active=True,
            )
        return team

    @fixture
    def project(self):
        return self.create_project(
            name='Bar',
            slug='bar',
            teams=[self.team],
        )

    @fixture
    def environment(self):
        return self.create_environment(
            name='development',
            project=self.project,
        )

    @fixture
    def group(self):
        return self.create_group(message=u'\u3053\u3093\u306b\u3061\u306f')

    @fixture
    def event(self):
        return self.create_event(
            event_id='a' * 32,
            message=u'\u3053\u3093\u306b\u3061\u306f',
        )

    @fixture
    def activity(self):
        return Activity.objects.create(
            group=self.group, project=self.project, type=Activity.NOTE, user=self.user, data={}
        )

    def create_organization(self, name=None, owner=None, **kwargs):
        if not name:
            name = petname.Generate(2, ' ', letters=10).title()

        org = Organization.objects.create(name=name, **kwargs)
        if owner:
            self.create_member(
                organization=org,
                user=owner,
                role='owner',
            )
        return org

    def create_member(self, teams=None, **kwargs):
        kwargs.setdefault('role', 'member')

        om = OrganizationMember.objects.create(**kwargs)
        if teams:
            for team in teams:
                self.create_team_membership(
                    team=team,
                    member=om,
                )
        return om

    def create_team_membership(self, team, member=None, user=None):
        if member is None:
            member, _ = OrganizationMember.objects.get_or_create(
                user=user,
                organization=team.organization,
                defaults={
                    'role': 'member',
                }
            )

        return OrganizationMemberTeam.objects.create(
            team=team,
            organizationmember=member,
            is_active=True,
        )

    def create_team(self, **kwargs):
        if not kwargs.get('name'):
            kwargs['name'] = petname.Generate(2, ' ', letters=10).title()
        if not kwargs.get('slug'):
            kwargs['slug'] = slugify(six.text_type(kwargs['name']))
        if not kwargs.get('organization'):
            kwargs['organization'] = self.organization
        members = kwargs.pop('members', None)

        team = Team.objects.create(**kwargs)
        if members:
            for user in members:
                self.create_team_membership(team=team, user=user)
        return team

    def create_environment(self, **kwargs):
        project = kwargs.get('project', self.project)
        name = kwargs.get('name', petname.Generate(3, ' ', letters=10)[:64])
        env = Environment.objects.create(
            organization_id=project.organization_id,
            project_id=project.id,
            name=name,
        )
        env.add_project(project)
        return env

    def create_project(self, **kwargs):
        teams = kwargs.pop('teams', None)

        if teams is None:
            teams = [self.team]

        if not kwargs.get('name'):
            kwargs['name'] = petname.Generate(2, ' ', letters=10).title()
        if not kwargs.get('slug'):
            kwargs['slug'] = slugify(six.text_type(kwargs['name']))
        if not kwargs.get('organization'):
            kwargs['organization'] = teams[0].organization

        project = Project.objects.create(**kwargs)
        for team in teams:
            project.add_team(team)
        return project

    def create_project_bookmark(self, project, user):
        return ProjectBookmark.objects.create(project_id=project.id, user=user)

    def create_project_key(self, project):
        return project.key_set.get_or_create()[0]

    # TODO(maxbittker) make new fixtures less hardcoded
    def create_release(self, project, user=None, version=None, date_added=None):
        if version is None:
            version = os.urandom(20).encode('hex')

        if date_added is None:
            date_added = timezone.now().replace(microsecond=0)

        release = Release.objects.create(
            version=version,
            organization_id=project.organization_id,
            date_added=date_added,
        )

        release.add_project(project)

        Activity.objects.create(
            type=Activity.RELEASE,
            project=project,
            ident=Activity.get_version_ident(version),
            user=user,
            data={'version': version},
        )

        # add commits
        if user:
            author = self.create_commit_author(project=project, user=user)
            repo = self.create_repo(project, name='organization-{}'.format(project.slug))
            commit = self.create_commit(
                project=project,
                repo=repo,
                author=author,
                release=release,
                key='deadbeef',
                message='placeholder commit message',
            )

            release.update(
                authors=[six.text_type(author.id)],
                commit_count=1,
                last_commit_id=commit.id,
            )

        return release

    def create_repo(self, project, name=None):
        repo = Repository.objects.create(
            organization_id=project.organization_id,
            name=name or '{}-{}'.format(petname.Generate(2, '',
                                                         letters=10), random.randint(1000, 9999)),
        )
        return repo

    def create_commit(self, repo, project=None, author=None, release=None,
                      message=None, key=None, date_added=None):
        commit = Commit.objects.get_or_create(
            organization_id=repo.organization_id,
            repository_id=repo.id,
            key=key or sha1(uuid4().hex).hexdigest(),
            defaults={
                'message': message or make_sentence(),
                'author': author or self.create_commit_author(organization_id=repo.organization_id),
                'date_added': date_added or timezone.now(),
            }
        )[0]

        if release:
            assert project
            ReleaseCommit.objects.create(
                organization_id=repo.organization_id,
                project_id=project.id,
                release=release,
                commit=commit,
                order=1,
            )

        self.create_commit_file_change(commit=commit, filename='/models/foo.py')
        self.create_commit_file_change(commit=commit, filename='/worsematch/foo.py')
        self.create_commit_file_change(commit=commit, filename='/models/other.py')

        return commit

    def create_commit_author(self, organization_id=None, project=None, user=None):
        return CommitAuthor.objects.get_or_create(
            organization_id=organization_id or project.organization_id,
            email=user.email if user else '{}@example.com'.format(make_word()),
            defaults={
                'name': user.name if user else make_word(),
            }
        )[0]

    def create_commit_file_change(self, commit, filename):
        commit_file_change = CommitFileChange.objects.get_or_create(
            organization_id=commit.organization_id,
            commit=commit,
            filename=filename,
            type='M',
        )
        return commit_file_change

    def create_user(self, email=None, **kwargs):
        if email is None:
            email = uuid4().hex + '@example.com'

        kwargs.setdefault('username', email)
        kwargs.setdefault('is_staff', True)
        kwargs.setdefault('is_active', True)
        kwargs.setdefault('is_superuser', False)

        user = User(email=email, **kwargs)
        if not kwargs.get('password'):
            user.set_password('admin')
        user.save()

        # UserEmail is created by a signal
        assert UserEmail.objects.filter(
            user=user,
            email=email,
        ).update(is_verified=True)

        return user

    def create_useremail(self, user, email, **kwargs):
        if not email:
            email = uuid4().hex + '@example.com'

        kwargs.setdefault('is_verified', True)

        useremail = UserEmail(user=user, email=email, **kwargs)
        useremail.save()

        return useremail

    def create_group(self, project=None, checksum=None, **kwargs):
        if checksum:
            warnings.warn('Checksum passed to create_group', DeprecationWarning)
        if project is None:
            project = self.project
        kwargs.setdefault('message', 'Hello world')
        kwargs.setdefault('data', {})
        if 'type' not in kwargs['data']:
            kwargs['data'].update(
                {
                    'type': 'default',
                    'metadata': {
                        'title': kwargs['message'],
                    },
                }
            )
        if 'short_id' not in kwargs:
            kwargs['short_id'] = project.next_short_id()
        return Group.objects.create(project=project, **kwargs)

    def create_file(self, **kwargs):
        return File.objects.create(**kwargs)

    def create_file_from_path(self, path, name=None, **kwargs):
        if name is None:
            name = os.path.basename(path)

        file = self.create_file(name=name, **kwargs)
        with open(path) as f:
            file.putfile(f)
        return file

    def create_event_attachment(self, event=None, file=None, **kwargs):
        if event is None:
            event = self.event

        if file is None:
            file = self.create_file(
                name='log.txt',
                size=32,
                headers={'Content-Type': 'text/plain'},
                checksum='dc1e3f3e411979d336c3057cce64294f3420f93a',
            )

        return EventAttachment.objects.create(
            project_id=event.project_id,
            group_id=event.group_id,
            event_id=event.event_id,
            file=file,
            **kwargs
        )

    def add_user_permission(self, user, permission):
        try:
            with transaction.atomic():
                UserPermission.objects.create(user=user, permission=permission)
        except IntegrityError:
            raise

    def create_sentry_app(self, name=None, organization=None, published=False, scopes=(),
                          webhook_url=None, **kwargs):
        if not name:
            name = petname.Generate(2, ' ', letters=10).title()
        if not organization:
            organization = self.create_organization()
        if not webhook_url:
            webhook_url = 'https://example.com/webhook'

        _kwargs = {
            'name': name,
            'organization': organization,
            'scopes': scopes,
            'webhook_url': webhook_url,
            'events': [],
        }

        _kwargs.update(kwargs)

        app = sentry_apps.Creator.run(**_kwargs)

        if published:
            app.update(status=SentryAppStatus.PUBLISHED)

        return app

    def create_sentry_app_installation(self, organization=None, slug=None, user=None):
        return sentry_app_installations.Creator.run(
            slug=(slug or self.create_sentry_app().slug),
            organization=(organization or self.create_organization()),
            user=(user or self.create_user()),
        )

    def create_service_hook(self, actor=None, project=None, events=None, url=None, **kwargs):
        if not actor:
            actor = self.create_user()
        if not project:
            org = self.create_organization(owner=actor)
            project = self.create_project(organization=org)
        if not events:
            events = ('event.created',)
        if not url:
            url = 'https://example/sentry/webhook'

        _kwargs = {
            'actor': actor,
            'project': project,
            'events': events,
            'url': url,
        }

        _kwargs.update(kwargs)

        return service_hooks.Creator.run(**_kwargs)

    def create_userreport(self, **kwargs):
        userreport = UserReport.objects.create(
            group=kwargs['group'],
            event_id='a' * 32,
            project=kwargs['project'],
            name='Jane Doe',
            email='jane@example.com',
            comments="the application crashed"
        )

        return userreport

    def create_plugin(self, org=None):
        org = org or self.organization
        plugin, _ = PluginRegistration.objects.get_or_create(
            name='tests_utils.create_plugin', version='1.0.0', organization=org)
        return plugin

    def register_extensible(self, klass, plugin=None):
        plugin = plugin or self.create_plugin()
        ret = self.app.extensibles.register(plugin, klass)
        return ret

    def create_substance(self, klass, name=None, **kwargs):
        properties = kwargs or dict()
        ret = self.register_extensible(klass)

        if not name:
            name = "sample-{}".format(uuid4())
        ret = self.app.extensibles.create(name, klass, self.organization, properties=properties)
        return ret

    def create_clims_project(self, klass, name=None, **kwargs):
        properties = kwargs or dict()
        ret = self.register_extensible(klass)

        if not name:
            name = "project-{}".format(uuid4())
        ret = self.app.extensibles.create(name, klass, self.organization, properties=properties)
        return ret

    def create_container(self, klass, name=None, prefix="container", **kwargs):
        properties = kwargs or dict()
        # TODO: Explicitly register only if required?
        ret = self.register_extensible(klass)

        if not name:
            name = "{}-{}".format(prefix, uuid4())
        ret = self.app.extensibles.create(name, klass, self.organization, properties=properties)
        return ret

    def create_container_with_samples(
            self, container_class, substance_class, prefix="container", sample_count=10):
        container = self.create_container(container_class, prefix=prefix)
        for _ in range(sample_count):
            sample = self.create_substance(substance_class, color='red')
            container.append(sample)
        container.save()
        return container
