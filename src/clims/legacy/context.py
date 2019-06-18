from __future__ import absolute_import
from clims.legacy.service.dilution.service import DilutionService
from clims.legacy import UnitConversion
from clims.legacy.repository import LegacyRepository, FileRepository
from clims.legacy.utils import lazyprop
from clims.legacy import LegacySession
from clims.legacy.service import (ArtifactService, FileService, StepLoggerService, LegacyService,
                                   ProcessService, ValidationService)
from clims.legacy.repository import StepRepository
from clims.legacy import utils
from clims.legacy.service.file_service import OSService
from clims.legacy.mappers.legacy_mapper import LegacyMapper


class ExtensionContext(object):
    """
    Defines context objects for extensions.


    Details: The context provides simplified access to underlying
    services, so the extension writer writes minimal code and is
    limited by default to only a subset of functionality, while being
    able to access the underlying services if needed.
    """

    def __init__(self, session, artifact_service, file_service, current_user,
                 step_logger_service, step_repo, legacy_service, dilution_service, process_service,
                 validation_service, test_mode=False,
                 disable_commits=False):
        """
        Initializes the context.

        :param session: An object encapsulating the connection to Legacy
        :param artifact_service: Provides access to artifacts in the current step
        :param file_service: Provides access to result files locally on the machine.
        :param step_logger_service: Provides access to logging via the context.
        :param current_user: The user executing the step
        :param step_repo: The repository for the current step
        :param legacy_service: General service for working with domain objects
        :param dilution_service: A service for handling dilutions
        :param test_mode: If set to True, extensions may behave slightly differently when testing, in particular
                          returning a constant time.
        :param disable_commits: True if commits should be ignored, e.g. when uploading files or updating UDFs.
        Useful when testing.
        """
        self.session = session
        self.logger = step_logger_service
        self.units = UnitConversion()
        self._update_queue = set()
        self.current_step = step_repo.get_process()
        self.artifact_service = artifact_service
        self.file_service = file_service
        self.current_user = current_user
        self.step_repo = step_repo
        self.dilution_scheme = None
        self.disable_commits = False
        self.dilution_service = dilution_service
        self.test_mode = test_mode
        self.legacy_service = legacy_service
        self.process_service = process_service
        self.validation_service = validation_service
        self.disable_commits = disable_commits
        self._calls_to_commit = 0

    @staticmethod
    def create(step_id, test_mode=False, uploaded_to_stdout=False, disable_commits=False):
        """
        Creates a context with all required services set up. This is the way
        a context is meant to be created in production and integration tests,
        use the constructor for custom use and unit tests.
        """
        session = LegacySession.create(step_id)
        legacy_mapper = LegacyMapper()
        step_repo = StepRepository(session, legacy_mapper)
        artifact_service = ArtifactService(step_repo)
        current_user = step_repo.current_user()
        file_repository = FileRepository(session)
        file_service = FileService(artifact_service, file_repository, False, OSService(),
                                   uploaded_to_stdout=uploaded_to_stdout,
                                   disable_commits=disable_commits,
                                   session=session)
        step_logger_service = StepLoggerService("Step log", file_service)
        validation_service = ValidationService(step_logger_service)
        legacy_service = LegacyService(
            LegacyRepository(), step_repo, legacy_mapper)
        process_service = ProcessService()
        dilution_service = DilutionService(validation_service)
        return ExtensionContext(session, artifact_service, file_service, current_user,
                                step_logger_service, step_repo, legacy_service,
                                dilution_service, process_service,
                                validation_service,
                                test_mode=test_mode, disable_commits=disable_commits)

    @staticmethod
    def create_mocked(session, step_repo, os_service, file_repository, legacy_service,
                      test_mode=False, uploaded_to_stdout=False, disable_commits=False):
        """
        A convenience method for creating an ExtensionContext that mocks out repos only. Used in integration tests
        that mock external requirements only. Since external data is always fetched through repositories only, this
        is ensured to limit calls to in-memory calls only, which under the developer's control.

        The session object, although not a repository, is also sent in.

        NOTE: The os_service is called a "service" but it's one that directly interacts with external resources.
        """

        # TODO: Legacy service does actual updates. Consider changing the name so we know it has side effects.
        # TODO: Reuse in create
        step_repo = step_repo
        artifact_service = ArtifactService(step_repo)
        current_user = step_repo.current_user()
        file_service = FileService(artifact_service, file_repository, False, os_service,
                                   uploaded_to_stdout=uploaded_to_stdout,
                                   disable_commits=disable_commits)
        step_logger_service = StepLoggerService("Step log", file_service)
        validation_service = ValidationService(step_logger_service)
        dilution_service = DilutionService(validation_service)
        process_service = ProcessService()
        return ExtensionContext(session, artifact_service, file_service, current_user,
                                step_logger_service, step_repo, legacy_service,
                                dilution_service, process_service, validation_service,
                                test_mode=test_mode, disable_commits=disable_commits)

    @lazyprop
    def error_log_artifact(self):
        """
        Returns a file on the current step that can be used for marking the step as having an error
        without having a visible UDF on the step.
        """
        file_list = [file for file in self.shared_files if self.step_log_name.lower()
                     in file.file_name.lower()]

        if not len(file_list) == 1:
            raise ValueError("This step is not configured with the shared file entry for {}".format(
                self.step_log_name))
        return file_list[0]

    @property
    def step_log_name(self):
        return self.validation_service.step_logger_service.step_logger_name.replace(' ', '_')

    @property
    def shared_files(self):
        """
        Fetches all share files for the current step
        """
        return self.artifact_service.shared_files()

    @lazyprop
    def all_analytes(self):
        return self.artifact_service.all_analyte_pairs()

    @lazyprop
    def output_containers(self):
        """
        Returns all output containers, with respective items
        """
        # TODO: Ensure that the artifacts are not fetched again
        return self.artifact_service.all_output_containers()

    @lazyprop
    def output_container(self):
        """
        A convenience method for fetching a single output container and raising
        an exception if there is more than one.
        """
        return utils.single(self.artifact_service.all_output_containers())

    @lazyprop
    def input_containers(self):
        """
        Returns a list with all input containers, where each container has been extended with the attribute
        `artifacts`, containing all artifacts in the container
        """
        return self.artifact_service.all_input_containers()

    @lazyprop
    def input_container(self):
        """
        A convenience method for fetching a single input container and raising
        an exception if there is more than one.
        """
        return utils.single(self.artifact_service.all_input_containers())

    def local_shared_file(self, legacy_file_handle, mode="r", is_xml=False,
                          is_csv=False, file_name_contains=None):
        """
        Downloads the file from the current step. The returned file is generally a regular
        file-like object, but can be casted to an xml object or csv by passing in is_xml or is_csv.


        NOTE: It would make sense to use constants instead of is_xml and is_csv, but since this
        is designed to be used by non-developers, this might be more readable.
        """
        def check_file_extension(extension):
            self.file_service.local_shared_file_provider.check_file_extension(
                legacy_file_handle,
                required_extension=extension,
                filename_contains=file_name_contains
            )

        if is_xml and is_csv:
            raise ValueError("More than one file type specifiers")
        f = self.file_service.local_shared_file(
            legacy_file_handle, mode=mode, file_name_contains=file_name_contains)
        if is_xml:
            check_file_extension('.xml')
            return self.file_service.parse_xml(f)
        elif is_csv:
            check_file_extension('.csv')
            return self.file_service.parse_csv(f)
        else:
            return f

    def output_result_file_by_id(self, file_id):
        """Returns the output result file by id"""
        return self.artifact_service.output_file_by_id(file_id)

    @property
    def output_result_files(self):
        return self.artifact_service.all_output_files()

    @property
    def pid(self):
        return self.current_step.id

    def update(self, obj):
        """Add an object that has a commit method to the list of objects to update"""
        self._update_queue.add(obj)

    def commit(self):
        """Commits all objects that have been added via the update method, using batch processing if possible"""
        self._calls_to_commit += 1
        if self._calls_to_commit > 1:
            self.logger.warning(
                "Commit called more than once. It's not necessary to call commit explicitly anymore.")
        self.legacy_service.update(self._update_queue, self.disable_commits)
        self.file_service.commit(self.disable_commits)

    @lazyprop
    def current_process_type(self):
        # TODO: Hang this on the process object
        return self.step_repo.get_process_type()
