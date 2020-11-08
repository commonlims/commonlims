from clims.configuration.work_batch_definition import WorkBatchDefinitionBase
from clims.configuration.hooks import button


class MyFancyStep(WorkBatchDefinitionBase):
    name = 'My fancy step'

    @button('My submit button')
    def on_button_click1(self):
        pass
