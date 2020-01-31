from __future__ import absolute_import


import os
from django.db import transaction


def require_no_transaction(allow_in_tests=True):
    # NOTE: This can not be tested for in the regular django tests, since they run in a transaction
    cxn = transaction.get_connection()
    if cxn.in_atomic_block:
        running_in_test_context = os.environ.get("PYTEST_CURRENT_TEST", None)
        if (not running_in_test_context) or (running_in_test_context and not allow_in_tests):
            raise AssertionError("Must not be in a transaction")
