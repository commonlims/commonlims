from clims.configuration.work import Work
from clims.configuration.hooks import button


class MyFancyWork(Work):
    name = 'My fancy work'

    @button('My submit button')
    def on_button_click1(self):
        pass
