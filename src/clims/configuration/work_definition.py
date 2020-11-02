from __future__ import absolute_import, print_function
from six import iteritems
from collections import namedtuple
from clims.configuration.hooks import HOOK_TAG
from clims.services.workbatch import WorkBatchBase


class WorkBatchDefinitionBase(WorkBatchBase):
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
    def full_name(cls):
        # Corresponds to 'full_name' in serializer
        return cls.type_full_name_cls()

    @classmethod
    def buttons(cls):
        buttons = list()
        for _, v in iteritems(cls.__dict__):
            if callable(v) and hasattr(v, HOOK_TAG):
                b = Button(name=v.__name__, caption=getattr(v, HOOK_TAG))
                buttons.append(b)
        return buttons

    @classmethod
    def trigger_script(cls, event, workbatch):
        class_dict = dict(cls.__dict__)
        for k, v in iteritems(class_dict):
            if cls._matches_event(k, v, event):
                # TODO: None as self is not pretty
                v(None, workbatch)

    @classmethod
    def _matches_event(cls, attribute_key, attribute_value, event):
        return callable(attribute_value) and attribute_key == event


class Button(namedtuple("Button", ['name', 'caption'])):
    pass
