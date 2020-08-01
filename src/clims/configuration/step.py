from __future__ import absolute_import, print_function
from six import iteritems


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
            if callable(v) and hasattr(v, '_hook_button_name'):
                buttons.append(v._hook_button_name)
        return buttons
