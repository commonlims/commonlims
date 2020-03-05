# Basic tests written to handle failures from py2.7 => py3.5 
# Can be removed after we've completed the switch
import pytest
from unittest import TestCase

class TestPipInstall(TestCase):
    """
    When installing with pip we might run build commands.
    """
    @pytest.mark.regression_py35
    def test_can_build_during_pip_install(self):
        # Asset file can't be loaded because there is an issue with writing binary strings to json
        from mock import MagicMock
        from sentry.utils.distutils.commands.build_assets import BuildAssetsCommand

        from distutils.dist import Distribution
        from mock import mock_open, patch

        dist = Distribution()
        dist.get_name = lambda: "sentry"
        cmd = BuildAssetsCommand(dist)

        cmd.work_path = "."
        cmd.build_lib = "src"
        p = cmd.get_asset_json_path()
        cmd._run_command = MagicMock()
        m = mock_open()
        with patch('{}.open'.format(__name__), m, create=True):
            cmd._build()

