from __future__ import absolute_import

import pytest
from sentry.testutils import TestCase
from mock import MagicMock
from sentry.plugins import (PluginMustHaveVersion, PluginIncorrectVersionFormat, PluginManager)
from sentry.utils.managers import InstanceManager
from sentry.plugins.base import Plugin2


class TestPlugins(TestCase):
    class PluginWithIncorrectVersionFixture(Plugin2):
        version = "1.0.something"

    def test_can_call_install_and_load(self):
        # Makes sure that the demo plugin shipped with the framework installs correctly
        # A similar call is made during `lims upgrade`, so all users have the demo plugin installed
        # by default.
        self.app.plugins.auto_install()  # Only installs information about the plugins in the database
        self.app.plugins.load_installed()  # Loads instances so they can be used
        # Materialize the plugins:
        list(self.app.plugins.all())

    def test_plugin_must_have_version(self):
        SomePlugin = MagicMock()
        SomePlugin.version = None
        SomePlugin.__name__ = "test"
        with pytest.raises(PluginMustHaveVersion):
            self.app.plugins.install_plugins(SomePlugin)

    def test_plugin_must_have_sortable_version(self):
        # Plugins must define a version string that can be parsed to a tuple of numbers

        with pytest.raises(PluginIncorrectVersionFormat):
            self.app.plugins.install_plugins(self.PluginWithIncorrectVersionFixture)


class TestPluginsVersionLoadChecks(TestCase):
    """
    Tests ensuring that the plugin manager correctly checks that the expected versions
    of Python objects are loaded, based on what has been registered in the database
    """

    def test_newest_plugin_gets_loaded(self):
        plugin_manager = PluginManager(InstanceManager())

        First = type("Somewhere.MyPlugin", (Plugin2,), {})
        First.version = "1.0.0"
        plugin_manager.install_plugins(First)  # Simulate the first install (registers to the db)

        Second = type("Somewhere.MyPlugin", (Plugin2,), {})
        Second.version = "2.0.0"
        plugin_manager.install_plugins(Second)

        plugin_manager.load = MagicMock()  # Mock away the actual load, we just wan't to inspect what it was called with
        plugin_manager.load_installed()  # Simulate loading the information (happens on every startup)

        assert len(plugin_manager.load.mock_calls) == 1
        _, args, _ = plugin_manager.load.mock_calls[0]
        assert args[0].version == "2.0.0"

    def test_raises_if_version_cannot_be_found(self):
        plugin_manager = PluginManager(InstanceManager())

        PluginCls = type("Somewhere.YouWillNotFindThisPlugin", (Plugin2,), {})
        PluginCls.version = "1.0.0"
        plugin_manager.install_plugins(PluginCls)
        # with pytest.raises(RequiredPluginCannotLoad):
        #     plugin_manager.load_installed()
        #     list(plugin_manager.all())
