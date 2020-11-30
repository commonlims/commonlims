from __future__ import absolute_import
import random
import logging
from uuid import uuid4

from clims.handlers import CreateExampleDataHandler
from ..models import ExampleSample, ExampleProject, PandorasBox, ExampleWorkBatch


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

        available_containers = []
        for ix in range(100):
            id = ix + 1
            # id = uuid4().hex
            name = 'pandora-{}'.format(id)
            try:
                container = self.app.containers.get(name=name)
                logger.info('Container already exists, fetched from db: {}'.format(container.name))
            except self.app.containers.DoesNotExist:
                container = PandorasBox(name=name)
                container.save()
                logger.info('Created container: {}'.format(container.name))
            available_containers.append(container)

        available_sample_types = ["Vampire Fang", "Zombie Brain", "Hydra Claw"]
        available_samples = []
        for _ix in range(100):
            # id = ix + 1
            id = random.randint(1, 10000000)
            name = "demoplugin-sample-{}".format(id)
            sample = ExampleSample(name=name,
                                   moxy=random.randint(1, 100),
                                   cool=random.randint(1, 100),
                                   erudite=random.randint(1, 100),
                                   sample_type=random.choice(available_sample_types))
            sample.save()
            available_samples.append(sample)
            logger.info("Created sample: {}".format(sample.name))
            plate = random.choice(available_containers)
            if not sample.location and len(list(plate.contents)) < plate.rows * plate.columns:
                plate.append(sample)
                sample.save()
                logger.info("Appended sample: {}".format(sample.name))

        for plate in available_containers:
            plate.save()

        pis = ["Rosalind Franklin", "Charles Darwin", "Gregor Mendel"]
        for _ in range(100):
            name = "demoplugin-project-{}".format(uuid4().hex)
            project = ExampleProject(name=name,
                    project_code=name,
                    pi=random.choice(pis))
            project.save()
            logger.info("Created project: {}".format(project.name))

        # Create workbatch to be used at wip workbatch details page. The
        # name of the workbatch has to be known here.
        workbatch = ExampleWorkBatch(name='wip-workbatch', status=1)
        workbatch.kit_type = "X"
        workbatch.save()
        logger.info("Created wip workbatch")

        # Create a workbatch of each type
        for _ix in range(5):
            name = "demoplugin-workbatch-{}".format(uuid4().hex)
            workbatch = ExampleWorkBatch(name=name,
                                         status=_ix)
            workbatch.save()
            logger.info("Created workbatch: {}".format(workbatch.name))

        # TODO: Create transitions
        # Select random samples for source
        num_transitions = 5
        source_samples = random.sample(available_samples, num_transitions)
        for source_sample in source_samples:
            logger.info("TODO: create transition from sample: {}".format(source_sample.name))
