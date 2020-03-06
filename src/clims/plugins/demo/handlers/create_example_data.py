
import random
import logging
from uuid import uuid4

from clims.handlers import CreateExampleDataHandler
from clims.plugins.demo.models import ExampleSample, ExampleProject


logger = logging.getLogger(__name__)


class DemoCreateExampleDataHandler(CreateExampleDataHandler):
    def handle(self):
        """
        Creates demo data for the example plugin

        Any plugin that implements this handler will supply demo data
        """

        logger.info("Creating example data for the builtin Demo plugin")

        created = True
        try:
            self.app.substances.get(name="demoplugin-sample-1")
        except self.app.substances.DoesNotExist:
            created = False

        if created:
            logger.info("Demo data has already been imported")
            return

        available_sample_types = ["Vampire Fang", "Zombie Brain", "Hydra Claw"]
        for ix in range(100):
            name = "demoplugin-sample-{}".format(ix + 1)
            sample = ExampleSample(name=name,
                                   organization=self.context.organization,
                                   moxy=random.randint(1, 100),
                                   cool=random.randint(1, 100),
                                   erudite=random.randint(1, 100),
                                   sample_type=random.choice(available_sample_types))
            sample.save()
            logger.info("Created sample: {}".format(sample.name))

        pis = ["Rosalind Franklin", "Charles Darwin", "Gregor Mendel"]
        for _ in range(100):
            name = "demoplugin-project-{}".format(uuid4().hex)
            project = ExampleProject(name=name,
                    organization=self.context.organization,
                    project_code=name,
                    pi=random.choice(pis))
            project.save()
            logger.info("Created project: {}".format(project.name))
