from __future__ import absolute_import, print_function
from six import iteritems
from clims.configuration.hooks import HOOK_TAG, HOOK_TYPE
from clims.handlers import Handler


class Work(Handler):
    """
    Configuration classes in plugins must inherit from this class. by
    doing so, the trigger points (hooks) will be recognized in UI.

    In plugin configuration, a trigger point is created as this:

    from configuration.step import Work
    from configuration.hooks import button
    from clims.services import TextField

    class MyFancyWork(Work):
        todays_flavour = TextField()

        @button('My submit button')
        def on_button_click1xx():
            from my_plugin_code.fancy_script import Fancy
            myscript = Fancy()
            myscript.run()

    This will happen:
    1. User enters a step in UI corresponding to Work
        > A button will appear with text "My submit button"
    2. User press button "My submit button"
        > The method "on_button_click1xx" is triggered

    """

    unique_registration = False

    def __init__(self, context, app, work_batch):
        super(Work, self).__init__(context, app)
        self.work_batch = work_batch

    def on_created(self):
        """
        Override this method in order to do custom actions when entering the step, such as
        naming the output container(s) or change other defaults
        """
        pass

    @classmethod
    def buttons(cls):
        buttons = list()
        for _, v in iteritems(cls.__dict__):
            if callable(v) and hasattr(v, HOOK_TAG):
                buttons.append(getattr(v, HOOK_TAG))
        return buttons

    @classmethod
    def trigger_script(cls, event_type, event_tag, workbatch):
        class_dict = dict(cls.__dict__)
        for _, v in iteritems(class_dict):
            if cls._matches_event_type(v, event_type):
                if hasattr(v, HOOK_TAG) and getattr(v, HOOK_TAG) == event_tag:
                    # TODO: None as self is not pretty
                    v(None, workbatch)
                elif not hasattr(v, HOOK_TAG):
                    v(None, workbatch)

    @classmethod
    def _matches_event_type(cls, class_attr, event_type):
        a = class_attr
        return callable(a) and hasattr(a, HOOK_TYPE) and getattr(a, HOOK_TYPE) == event_type


class AvailableWorkView(object):
    """
    Base class for the view that shows available work. Used to configure the columns that are shown.
    """


class Column(object):
    """
    Configures a column in a view.
    """

    def __init__(self):
        pass
