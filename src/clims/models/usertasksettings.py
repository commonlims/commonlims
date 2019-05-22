from __future__ import absolute_import

# NOTE: UserTaskSettings and related objects are not Django models. They are created when the plugin
# is registered and possibly cached in redis.


class UserTaskSettings(object):
    """Defines the settings for a user task in concrete terms that can be used by
    a UserTask view

    A UserTask contains 0..n sub user tasks, which can dependencies on each other (DAG).

    Each sub user task can have 0..n fields which might need to be filled. They can also have
    actions.

    All fields and actions have an identifier for where they should be positioned in the UI
    (e.g. in a tab with the title `tab1`)

    The UserTaskSettingsBuilder can be used to create UserTaskSettings simply and readably.
    """

    def __init__(self):
        self.subtasks = list()
        self.handles = list()


class UserTaskSettingsBuilder(object):
    """
    Defines a user task using the basic UI and validation provided by the Common LIMS framework.
    """

    def __init__(self):
        self._settings = None

    def place_samples(self, settings):
        """
        If the developer overrides place_samples, the "PlaceSamples" component will be shown
        as the settings.visible is set to True by default. If they don't override it, it's set to false
        as this base class defines it as False
        """
        settings.enabled = False

    def fields(self, settings):
        """
        List of fields that should be shown. If the user inherits from this, one or more tab views will be shown
        for fields.
        """
        settings.enabled = False

    def files(self, settings):
        """
        List of files to related to the user task.
        """
        settings.enabled = False

    def activity(self, settings):
        """
        Show an activity view
        """
        settings.enabled = False

    def handles(self):
        """Override this method with a list of workflow user tasks keys that this should handle.

        One UserTaskSetting can be set up to handle several different kinds of UserTasks, but every
        user task in a workflow must have only one such class.

        Example:
            return ["clims_snpseq.core.workflows.reception_qc:FragmentAnalyzerDNA",
                    "clims_snpseq.core.workflows.reception_qc:FragmentAnalyzerRNA"]

            This would handle the UserTask FragmentAnalyzerDNA and ...RNA in that process, so
            fetching /api/0/user-task-settings/snpseq/clims_snpseq.core.workflows.reception_qc:FragmentAnalyzer[DNA|RNA]
            would both return this class. However, if there would be another class also specifying that it handles
            clims_snpseq...:FragmentAnalyzerDNA, that would raise an error on startup.
        """
        return list()

    def _build_settings(self):
        """Builds a single settings object"""
        ret = UserTaskSettings()
        import inspect
        custom = inspect.getmembers(self, predicate=inspect.ismethod)
        custom = [method for name, method in custom if name.startswith("custom_")]

        _methods = [self.place_samples,
                    self.fields,
                    self.files] + custom

        ret.handles = list(self.handles())
        ret.builder_name = self.__class__.__module__ + "." + self.__class__.__name__

        for method in _methods:
            subtask_settings_builder = SubtaskSettingsBuilder()
            method(subtask_settings_builder)
            if subtask_settings_builder.enabled:
                ret.subtasks.append(subtask_settings_builder.settings)
        return ret

    def get_settings(self):
        if self._settings is None:
            self._settings = self._build_settings()
        return self._settings


class UserTaskAction(object):
    def __init__(self, title, description, order=None):
        self.title = title
        self.description = description
        self.order = order


class UserTaskField(object):
    def __init__(self, field_name, title, description=None,
                 required=False, details=False, order=None):
        self.field_name = field_name
        self.title = title
        self.description = description
        self.required = required
        self.details = details
        self.order = order


class SubtaskSettings(object):
    VIEW_TYPE_BUTTON = "button"
    VIEW_TYPE_POPUP = "popup"
    VIEW_TYPE_TAB = "tab"

    def __init__(self):
        self.actions = list()
        self.fields = list()
        self.view_type = None
        self.title = None


class SubtaskSettingsBuilder(object):
    def __init__(self, enabled=True):
        self._actions_and_fields = list()
        self.enabled = enabled
        self.settings = SubtaskSettings()
        self._append_order = 0

    def show_as_button(self, title=None):
        self.settings.view_type = self.settings.VIEW_TYPE_BUTTON
        self.settings.title = title

    def show_as_popup(self, title=None):
        self.settings.view_type = self.settings.VIEW_TYPE_POPUP
        self.settings.title = title

    def show_as_tab(self, title=None):
        self.settings.view_type = self.settings.VIEW_TYPE_TAB
        self.settings.title = title

    def append(self, action_or_field):
        if not action_or_field.order:
            action_or_field.order = self._append_order
        # self.settings.actions_and_fields.append(action_or_field)
        if isinstance(action_or_field, UserTaskAction):
            self.settings.actions.append(action_or_field)
        elif isinstance(action_or_field, UserTaskField):
            self.settings.fields.append(action_or_field)
        else:
            raise TypeError("Expecting either a field or an action")

        self._append_order += 1

    def action(self, *params, **kwargs):
        # Convenience function for a more readable configuration.
        # TODO: add params and kwargs like in UserTaskAction so that the user will see
        # hints in an IDE (the same for field())
        action = UserTaskAction(*params, **kwargs)
        self.append(action)

    def field(self, *params, **kwargs):
        # Convenience function for a more readable configuration
        field = UserTaskField(*params, **kwargs)
        self.append(field)
