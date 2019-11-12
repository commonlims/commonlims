from __future__ import absolute_import, print_function
from django.db import models
from sentry.db.models import Model


class SearchIndex(Model):
    """
    Contains tracking information for indexing documents in the database.

    This data is transient, i.e. this table can safely be cleared at any point (search indexes
    will then have to be remade)
    """
    __core__ = True

    # This table contains similar data to the 'tracking_column' used by logstash:
    # https://www.elastic.co/blog/
    #   how-to-keep-elasticsearch-synchronized-with-a-relational-database-using-logstash

    # All user tasks can have one or more sample batch
    document = models.TextField()  # E.g. 'sample'

    # Any information that makes sense for tracking this document
    tracking_info = models.TextField()
