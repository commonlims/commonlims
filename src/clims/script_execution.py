from __future__ import absolute_import
from abc import abstractmethod


class ScriptExecution(object):
    """
    The intention of this class is to separate script execution from db transactions.

    If script execution was successful, commit the actions intended in the script.
    That is to either save artifacts in update queue to db and/or upload
    generated files to db. Otherwise, if script was not successful, push the error message.

    This class corresponds to work done in ExtensionService in clarity-ext
    """

    def run(self, script):
        script.execute()
        script.commit()


class ScriptBaseClass(object):
    @abstractmethod
    def execute(self):
        pass

    @abstractmethod
    def commit(self):
        pass
