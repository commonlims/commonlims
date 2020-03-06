

from clims.handlers import SubstancesSubmissionHandler


# If we register both this plugin and the gemstones plugin, we'll get an error because the app will
# not know which handler should take care of substance submissions
class GemstoneSubstancesSubmissionEx(SubstancesSubmissionHandler):
    def handle(self, file_obj):
        print("We know gemstones")  # NOQA
