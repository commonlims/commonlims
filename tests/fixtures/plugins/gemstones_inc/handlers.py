

from tests.fixtures.plugins.gemstones.handlers \
    import GemstoneSubstancesSubmission

from .models import GemstoneSample


class GemstoneSubstancesSubmissionEx(GemstoneSubstancesSubmission):
    def handle(self, file_obj):
        print("The industry is handling this!!!")  # noqa
        if not file_obj.name.endswith(".csv"):
            raise self.UsageError("Sample submission files must be in csv format")

        csv = file_obj.as_csv()

        # Map directly to our sample type
        for line in csv:
            sample = GemstoneSample(name=line['name'])
            sample.color = "red"
            self.substances.add(sample)
