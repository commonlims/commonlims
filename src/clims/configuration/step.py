from __future__ import absolute_import, print_function
from six import iteritems
from clims.configuration.hooks import HOOK_TAG, HOOK_TYPE


class Step:
    """
    Configuration classes in plugins must inherit from this class. by
    doing so, the trigger points (hooks) will be recognized in UI.

    In plugin configuration, a trigger point is created as this:

    from configuration.step import Step
    from configuration.hooks import button
    from clims.services import TextField

    class MyFancyStep(Step):
        todays_flavour = TextField()

        @button('My submit button')
        def on_button_click1xx():
            from my_plugin_code.fancy_script import Fancy
            myscript = Fancy()
            myscript.run()

    This will happen:
    1. User enters a step in UI corresponding to MyFancyStep
        > A button will appear with text "My submit button"
    2. User press button "My submit button"
        > The method "on_button_click1xx" is triggered

    """
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
