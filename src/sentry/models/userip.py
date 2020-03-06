

from django.conf import settings
from django.db import models
from django.utils import timezone

from sentry.db.models import FlexibleForeignKey, Model, sane_repr


class UserIP(Model):
    __core__ = True

    user = FlexibleForeignKey(settings.AUTH_USER_MODEL)
    ip_address = models.GenericIPAddressField()
    country_code = models.CharField(max_length=16, null=True)
    region_code = models.CharField(max_length=16, null=True)
    first_seen = models.DateTimeField(default=timezone.now)
    last_seen = models.DateTimeField(default=timezone.now)

    class Meta:
        app_label = 'sentry'
        db_table = 'sentry_userip'
        unique_together = (('user', 'ip_address'), )

    __repr__ = sane_repr('user_id', 'ip_address')

    @classmethod
    def log(cls, user, ip_address):
        values = {
            'last_seen': timezone.now(),
        }
        UserIP.objects.create_or_update(
            user=user,
            ip_address=ip_address,
            values=values,
        )
