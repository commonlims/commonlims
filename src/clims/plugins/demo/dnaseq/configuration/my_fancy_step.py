from clims.services.workbatch import WorkBatchBase
from clims.configuration.hooks import button


class MyFancyStep(WorkBatchBase):
    name = 'My fancy step'

    @button('My submit button')
    def on_button_click1(self):
        pass
