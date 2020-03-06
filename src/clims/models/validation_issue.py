


VALIDATION_RESULT_TYPE_ERROR = "error"
VALIDATION_RESULT_TYPE_WARNING = "warning"
VALIDATION_RESULT_TYPE_INFO = "info"
VALIDATION_RESULT_TYPE_DEBUG = "debug"

ALL_VALIDATION_RESULT_TYPES = (
    VALIDATION_RESULT_TYPE_ERROR,
    VALIDATION_RESULT_TYPE_WARNING,
    VALIDATION_RESULT_TYPE_INFO,
    VALIDATION_RESULT_TYPE_DEBUG,
)


class ValidationIssue(object):
    def __init__(self, type, msg=None, column=None, row=None, file=None, object_id=None):
        """
        :entry_id: Any identifier for the data being processed (e.g. sample id)
        """
        if type not in ALL_VALIDATION_RESULT_TYPES:
            raise AssertionError(
                "Type must be one of {}".format(", ".join(ALL_VALIDATION_RESULT_TYPES)))
        self.type = type
        self.msg = msg
        self.column = column
        self.row = row
        self.file = file
        self.object_id = object_id
