from clims.configuration.step import Step
from clims.configuration.hooks import button


class MyFancyStep(Step):
    name = 'My fancy step'

    @button('My submit button')
    def on_button_click1(self):
        pass
