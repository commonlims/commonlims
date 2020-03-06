

# TODO: Decide if we want to keep the whole WorkBatch in the database too or if it should just
# be fetched from the plugin and saved in redis (which is much simpler). In the latter case, we would
# just have to ensure to log the version of the plugin and the source code knows what happened.
# In the POC, let's start with defining the model outside of Django

from sentry.models import WorkBatch


class WorkBatchContext(object):
    def __init__(self, work_batch):
        self.work_batch = work_batch

    @staticmethod
    def get_by_id(work_batch_id):
        return WorkBatch.objects.get(pk=work_batch_id)

    @staticmethod
    def create():
        # Creates a new WorkBatchContext

        # Create the domain object, then wrap it in a context
        work_batch = WorkBatch()
        work_batch.save()

        return WorkBatchContext(work_batch)
