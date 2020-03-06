

from django.db import models

from . import AvatarBase


class OrganizationAvatar(AvatarBase):
    """
    An OrganizationAvatar associates an Organization with their avatar photo File
    and contains their preferences for avatar type.
    """

    AVATAR_TYPES = ((0, 'letter_avatar'), (1, 'upload'), )

    FILE_TYPE = 'avatar.file'

    organization = models.OneToOneField('sentry.Organization', related_name='avatar')
    avatar_type = models.PositiveSmallIntegerField(default=0, choices=AVATAR_TYPES)

    class Meta:
        app_label = 'sentry'
        db_table = 'sentry_organizationavatar'

    def get_cache_key(self, size):
        return 'org_avatar:%s:%s' % (self.organization_id, size)
