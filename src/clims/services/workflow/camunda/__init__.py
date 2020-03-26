from __future__ import absolute_import

import os
import inspect
import logging
from clims.services.workflow import WorkflowBase
from .client import CamundaClient  # noqa


logger = logging.getLogger(__name__)


class CamundaWorkflow(WorkflowBase):
    """
    A definition for a Camunda workflow, requires a companion .bpmn file with the same
    name as the class which resides in the module.
    """

    @classmethod
    def get_bpmn_path(cls):
        """
        Returns the .bpmn file that further defines the workflow or subworkflow.
        This file is what's uploaded to the external workflow engine.
        """
        module_path = os.path.dirname(inspect.getfile(inspect.getmodule(cls)))
        logger.debug("Searching for .bpmn file at {}".format(module_path))

        for file_path in os.listdir(module_path):
            fname, ext = os.path.splitext(file_path)
            if ext == ".bpmn" and fname == cls.__name__:
                logger.debug("Found a matching bpmn file: {}".format(file_path))
                return os.path.join(module_path, file_path)
        raise AssertionError("Can't find a bpmn file that matches {}".format(cls.__name__))
