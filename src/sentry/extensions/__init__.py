from __future__ import absolute_import

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
