# TestCase imported
from unittest import TestCase
import pytest


@pytest.mark.unit_test
class UnitTestCase(TestCase):
    """
    Unit tests require no access to any external system. For our purposes, they may integrate
    different components, but should make no connections outside of the process.
    """
    pass
