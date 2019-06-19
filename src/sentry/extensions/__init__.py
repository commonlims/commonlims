from __future__ import absolute_import

# TODO: Decide if we want to keep the whole UserTask in the database too or if it should just
# be fetched from the plugin and saved in redis (which is much simpler). In the latter case, we would
# just have to ensure to log the version of the plugin and the source code knows what happened.
# In the POC, let's start with defining the model outside of Django

from sentry.models import UserTask


class UserTaskContext(object):
    def __init__(self, user_task):
        self.user_task = user_task

    @staticmethod
    def get_by_id(user_task_id):
        return UserTask.objects.get(pk=user_task_id)

    @staticmethod
    def create():
        # Creates a new UserTaskContext

        # Create the domain object, then wrap it in a context
        user_task = UserTask()
        user_task.save()

        return UserTaskContext(user_task)
