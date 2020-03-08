

import logging
from collections import defaultdict
from clims.legacy.domain import ResultFile, Artifact, Aliquot, utils, Analyte, ArtifactPair
from clims.legacy.domain.shared_result_file import SharedResultFile
from clims.legacy.repository import StepRepository
from clims.legacy import LegacySession


class ArtifactService:
    """
    Provides access to "Artifacts" in Legacy, e.g. analytes and result files.

    Artifacts are fetched through the step_repository, provided in the constructor.

    All objects fetched from the step repository are cached.
    """

    def __init__(self, step_repository, logger=None):
        self.step_repository = step_repository
        self.logger = logger or logging.getLogger(__name__)
        self._artifacts = None
        self._parent_input_artifacts_by_sample_id = None

    def all_artifacts(self):
        # NOTE: The underlying REST library does also do some caching, but since this library wraps
        # objects, some benefit may be achieved by caching on this level too.
        if not self._artifacts:
            self._artifacts = self.step_repository.all_artifacts()
        return self._artifacts

    def shared_files(self):
        """
        Returns all shared files for the current step
        """
        outputs = (outp for inp, outp in self.all_artifacts())
        shared_files = (
            outp for outp in outputs if isinstance(outp, SharedResultFile))
        ret = list(utils.unique(shared_files, lambda f: f.id))
        assert len(ret) == 0 or isinstance(ret[0], SharedResultFile)
        return ret

    def all_aliquot_pairs(self):
        """
        Returns all aliquots in a step as an artifact pair (input/output)
        """
        pairs = self.step_repository.all_artifacts()
        aliquots_only = [pair for pair in pairs if isinstance(pair[0], Aliquot) and
                         isinstance(pair[1], Aliquot)]
        return [ArtifactPair(i, o) for i, o in aliquots_only]

    def all_analyte_pairs(self):
        """
        Returns all analytes in a step as an artifact pair (input/output)
        """
        pairs = self.all_artifacts()
        analytes_only = [pair for pair in pairs if isinstance(pair[0], Analyte) and
                         isinstance(pair[1], Analyte)]
        return [ArtifactPair(i, o) for i, o in analytes_only]

    def all_input_artifacts(self):
        """Returns a unique list of input artifacts"""
        return utils.unique(self._filter_artifact(True, Artifact), lambda item: item.id)

    def all_output_artifacts(self):
        """Returns a unique list of output artifacts"""
        return utils.unique(self._filter_artifact(False, Artifact), lambda item: item.id)

    def _filter_artifact(self, input, type):
        # Fetches all input analytes in the step, unique
        pair_index = 0 if input else 1
        for pair in self.all_artifacts():
            if isinstance(pair[pair_index], type):
                yield pair[pair_index]

    def all_input_analytes(self):
        """Returns a unique list of input analytes"""
        return [x for x in self.all_input_artifacts() if isinstance(x, Analyte)]

    def all_output_analytes(self):
        """Returns a unique list of output analytes"""
        return [x for x in self.all_output_artifacts() if isinstance(x, Analyte)]

    def all_output_containers(self):
        containers_non_unique = (artifact.container
                                 for artifact in self.all_output_artifacts()
                                 if isinstance(artifact, Aliquot) and artifact.container is not None)
        containers = utils.unique(
            containers_non_unique, lambda item: item.id)
        return list(containers)

    def all_input_containers(self):
        artifacts_having_container = (artifact.container
                                      for artifact in self.all_input_artifacts()
                                      if artifact.container is not None)
        containers = utils.unique(
            artifacts_having_container, lambda item: item.id)
        return list(containers)

    def all_output_files(self):
        outputs = (outp for inp, outp in self.all_artifacts())
        files = (outp for outp in outputs
                 if outp.output_type == Artifact.OUTPUT_TYPE_RESULT_FILE)
        ret = list(utils.unique(files, lambda f: f.id))
        return ret

    def output_file_by_id(self, file_id):
        ret = utils.single(
            [outp for outp in self.all_output_files() if outp.id == file_id])
        return ret

    def all_shared_result_files(self):
        outputs = (outp for inp, outp in self.all_artifacts())
        files = (outp for outp in outputs
                 if outp.output_type == Artifact.OUTPUT_TYPE_SHARED_RESULT_FILE)
        ret = list(utils.unique(files, lambda f: f.id))
        assert len(ret) == 0 or isinstance(ret[0], ResultFile)
        return ret

    def parent_input_artifacts(self):
        """
        Returns a dictionary of all parent input artifacts, indexed by process ID.

        Details:
        In your current step (CS), you will have input and output artifacts like this:
            [CS-I1  ->  CS-O1]
            [CS-I2  ->  CS-O2]
            ...

        These artifacts may be coming from a parent step (PS):
            [PS-I1  ->  PS-O1]  -> [CS-I1   -> CS-O2]
            ...

        This method will fetch all of the input artifacts based on all of your output artifacts in one call
        and index them by their respective process id.
        """
        # We will need the input artifacts from the previous step
        parent_processes = set(
            [artifact.input.parent_process for artifact in self.all_output_artifacts()])

        for process in parent_processes:
            # This might seem roundabout, but for simplicity, we create another artifact service for
            # fetching the parent items:
            parent_step_repo = StepRepository(LegacySession.create(process.id),
                                              self.step_repository.legacy_mapper)
            parent_artifact_service = ArtifactService(parent_step_repo)
            for input in parent_artifact_service.all_input_artifacts():
                yield input

    def get_parent_input_artifact(self, sample):
        """
        Given a sample in some artifact, returns a list of parent artifacts for that sample. This should usually
        be just one artifact, but that depends on e.g. if the sample has been requeued.

        Performance note:
        Starts by fetching all input artifacts of all parent processes (to save time if there are further calls)
        """
        if not self._parent_input_artifacts_by_sample_id:
            parent_input_artifacts = list(self.parent_input_artifacts())
            self._parent_input_artifacts_by_sample_id = defaultdict(list)
            for parent_input_artifact in parent_input_artifacts:
                for current_sample in parent_input_artifact.samples:
                    self._parent_input_artifacts_by_sample_id[current_sample.id].append(
                        parent_input_artifact)
        return self._parent_input_artifacts_by_sample_id[sample.id]

    def all_output_result_files(self):
        """
        Returns all individual output `ResultFile`s. These are generated "per input".
        """
        return [output for _, output in self.all_artifacts()
                if output.generation_type == output.PER_INPUT]

    def get_all_analyte_pairs_from_process(self, process):
        """
        Returns all analyte_pairs from a specific process
        """
        process_step_repo = StepRepository(LegacySession.create(process.id),
                                           self.step_repository.legacy_mapper)
        parent_artifact_service = ArtifactService(process_step_repo)
        return parent_artifact_service.all_analyte_pairs()
