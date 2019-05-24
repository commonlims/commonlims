from __future__ import absolute_import
from clims.legacy.domain.artifact import Artifact
from clims.legacy.domain.udf import UdfMapping
from clims.legacy import utils
import requests


class SharedResultFile(Artifact):

    def __init__(self, api_resource=None, id=None, name=None, udf_map=None, files=None):
        super(SharedResultFile, self).__init__(api_resource=api_resource,
                                               artifact_id=id,
                                               name=name,
                                               udf_map=udf_map)
        # TODO: These files are currently represented with api resources, not internal
        # domain objects
        self.files = files or list()

    def remove_files(self, disabled, logger, session):
        self._unlink_files_from_artifact(disabled, logger, session)
        self.files = list()

    @property
    def file_name(self):
        if len(self.files) > 0:
            return self.files[0].original_location
        else:
            return ''

    def _unlink_files_from_artifact(self, disabled, logger, session):
        for f in self.files:
            if disabled:
                logger.info("Removing (disabled) file: {}".format(f.uri))
                return
            # TODO: Add to another service
            r = requests.delete(f.uri, auth=(session.api.username, session.api.password))
            if r.status_code != 204:
                raise RemoveFileException("Can't remove file with id {}. Status code was {}".format(
                    f.id, r.status_code))

    @staticmethod
    def create_from_rest_resource(resource, process_type=None):
        name = resource.name
        process_output = utils.single([process_output for process_output in process_type.process_outputs
                                       if process_output.output_generation_type == "PerAllInputs" and
                                       process_output.artifact_type == "ResultFile"])
        udfs = UdfMapping.expand_udfs(resource, process_output)
        udf_map = UdfMapping(udfs)

        return SharedResultFile(api_resource=resource, id=resource.id, name=name, udf_map=udf_map,
                                files=resource.files)

    def __repr__(self):
        typename = type(self).__name__
        return "{}<{} ({})>".format(typename, self.name, self.id)


class RemoveFileException(Exception):
    pass
