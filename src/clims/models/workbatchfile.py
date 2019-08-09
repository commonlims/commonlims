"""
sentry.models.usertaskfile
~~~~~~~~~~~~~~~~~~~~~~~~~

:copyright: (c) 2010-2015 by the Sentry Team, see AUTHORS for more details.
:license: BSD, see LICENSE for more details.
"""

from __future__ import absolute_import

from django.db import models
from six.moves.urllib.parse import urlsplit, urlunsplit

from sentry.db.models import FlexibleForeignKey, Model, sane_repr
from sentry.utils.hashlib import sha1_text


class WorkBatchFile(Model):
    r"""
    A WorkBatchFile is an association between a WorkBatch and a File.

    The ident of the file should be sha1(name) and must be unique per user task.
    """
    __core__ = False

    organization = FlexibleForeignKey('sentry.Organization')
    work_batch = FlexibleForeignKey('clims.WorkBatch')
    file = FlexibleForeignKey('sentry.File')
    ident = models.CharField(max_length=40)
    name = models.TextField()

    __repr__ = sane_repr('work_batch', 'ident')

    class Meta:
        unique_together = (('work_batch', 'ident'), )
        index_together = (('work_batch', 'name'), )
        app_label = 'clims'
        db_table = 'clims_workbatchfile'

    def save(self, *args, **kwargs):
        if not self.ident and self.name:
            self.ident = type(self).get_ident(self.name)
        return super(WorkBatchFile, self).save(*args, **kwargs)

    def update(self, *args, **kwargs):
        # If our name is changing, we must also change the ident
        if 'name' in kwargs and 'ident' not in kwargs:
            kwargs['ident'] = self.ident = type(self).get_ident(kwargs['name'])
        return super(WorkBatchFile, self).update(*args, **kwargs)

    @classmethod
    def get_ident(cls, name):
        return sha1_text(name).hexdigest()

    @classmethod
    def normalize(cls, url):
        """Transforms a full absolute url into 2 or 4 generalized options

        * the original url as input
        * (optional) original url without querystring
        * the full url, but stripped of scheme and netloc
        * (optional) full url without scheme and netloc or querystring
        """
        # Always ignore the fragment
        scheme, netloc, path, query, _ = urlsplit(url)
        uri_relative = (None, None, path, query, None)
        uri_without_query = (scheme, netloc, path, None, None)
        uri_relative_without_query = (None, None, path, None, None)
        urls = [url]
        if query:
            urls.append(urlunsplit(uri_without_query))
        urls.append('~' + urlunsplit(uri_relative))
        if query:
            urls.append('~' + urlunsplit(uri_relative_without_query))
        return urls
