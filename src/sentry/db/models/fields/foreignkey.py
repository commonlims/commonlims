"""
sentry.db.models.fields.foreignkey
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

:copyright: (c) 2010-2014 by the Sentry Team, see AUTHORS for more details.
:license: BSD, see LICENSE for more details.
"""



from django.db.models import ForeignKey

__all__ = ('FlexibleForeignKey', )


class FlexibleForeignKey(ForeignKey):
    def db_type(self, connection):
        # This is required to support BigAutoField (or anything similar)
        rel_field = self.target_field
        if hasattr(rel_field, 'get_related_db_type'):
            return rel_field.get_related_db_type(connection)
        return super(FlexibleForeignKey, self).db_type(connection)
