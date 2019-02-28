from __future__ import absolute_import


class LegacyRepository(object):
    def update(self, resource):
        resource.put()
