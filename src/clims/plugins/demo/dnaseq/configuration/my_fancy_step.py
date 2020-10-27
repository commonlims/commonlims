from clims.configuration.work_definition import WorkDefinitionBase
from clims.configuration.hooks import button


class MyFancyStep(WorkDefinitionBase):
    name = 'My fancy step'

    @button('My submit button')
    def on_button_click1(self):
        pass
