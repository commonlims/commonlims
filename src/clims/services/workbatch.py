from __future__ import absolute_import
from six import iteritems
from collections import namedtuple
from sentry.models.file import File
from clims.services.file_handling.file_service import FILENAME_RE, FileNameValidationError
from clims.services.extensible import ExtensibleBase
from clims.services.base_extensible_service import BaseExtensibleService
from clims.services.base_extensible_service import BaseQueryBuilder
from clims.models.workbatchfile import WorkBatchFile as WorkBatchFileModel
from clims.models.work_batch import WorkBatch, WorkBatchVersion
from clims.configuration.hooks import HOOK_TAG, HOOK_TYPE


class WorkbatchService(BaseExtensibleService):
    def __init__(self, app):
        super(WorkbatchService, self).__init__(app, WorkBatchBase)


class WorkBatchBase(ExtensibleBase):
    """
    In plugin configuration, an event triggered at a button click
    is created as this:

    from configuration.work_batch_defintion import WorkBatchDefinitionBase
    from configuration.hooks import button
    from clims.services import TextField

    class MyFancyStep(WorkBatchDefinitionBase):
        todays_flavour = TextField()

        @button('My submit button')
        def on_button_click1xx():
            from my_plugin_code.fancy_script import Fancy
            myscript = Fancy()
            myscript.run()

    This will happen:
    1. User enters a step in UI corresponding to MyFancyStep
        > A button will appear with text "My submit button"
    2. User press button "My submit button"
        > The method "on_button_click1xx" is triggered

    """
    WrappedArchetype = WorkBatch
    WrappedVersion = WorkBatchVersion

    def __init__(self, **kwargs):
        super(WorkBatchBase, self).__init__(**kwargs)
        self.parent_substances = None
        self.child_substances = None
        self._update_queue = list()

    def stage_update(self, obj):
        self._update_queue.append(obj)

    def commit(self):
        for queued_object in self._update_queue:
            queued_object.save()

    def output_plates(self):
        ret_dict = {
            s.location.container.id: s.location.container
            for s in self.child_substances if s.location
        }
        return [ret_dict[id] for id in ret_dict]

    @classmethod
    def cls_full_name(cls):
        # Corresponds to 'full_name' in serializer
        return cls.type_full_name_cls()

    @classmethod
    def _get_hooks_for(cls, hook_type):
        hooks = list()
        for _, v in iteritems(cls.__dict__):
            if callable(v) and \
                    hasattr(v, HOOK_TYPE) and getattr(v, HOOK_TYPE) == hook_type:
                hooks.append(Hook(callable=v, hook_tag=getattr(v, HOOK_TAG, None)))
        return hooks

    @classmethod
    def buttons(cls):
        buttons = list()
        for hook in cls._get_hooks_for('button'):
            b = Button(name=hook.callable.__name__, caption=hook.hook_tag)
            buttons.append(b)
        return buttons

    @classmethod
    def criterias(cls):
        return [c for c in cls._get_hooks_for('criteria')]

    @classmethod
    def criteria_descriptions(cls):
        return [c.hook_tag for c in cls.criterias()]

    def is_satisfied_by(self, substance):
        for c in self.__class__.criterias():
            if not c.callable(self, substance):
                return False
        return True

    @classmethod
    def fields(cls):
        extensible_base_fields = cls.get_fields()
        fields = list()
        for extensible_field in extensible_base_fields:
            f = Field(
                type=extensible_field.type,
                caption=extensible_field.display_name,
                prop_name=extensible_field.prop_name,
            )
            fields.append(f)
        return fields

    def trigger(self, event):
        class_dict = dict(self.__class__.__dict__)
        for k, v in iteritems(class_dict):
            if self._matches_event(k, v, event):
                v(self)

    def _matches_event(self, attribute_key, attribute_value, event):
        return callable(attribute_value) and attribute_key == event

    def add_file(self, file_stream, name, file_handle):
        if FILENAME_RE.search(name):
            raise FileNameValidationError('File name must not contain special whitespace characters')
        file_model = File()
        file_model.save()
        file_stream.seek(0)
        file_model.putfile(file_stream)
        work_batch_file = WorkBatchFileModel(
            organization=self.organization, work_batch=self._archetype,
            name=name, file=file_model, file_handle=file_handle
        )
        work_batch_file.save()
        self._archetype.files.add(work_batch_file)
        self.save()

    def get_single_file(self, file_handle=None):
        from clims.utils import single_or_default, UnexpectedLengthError
        try:
            file_model = single_or_default(
                [f for f in self._archetype.files.all() if f.file_handle == file_handle]
            )
        except UnexpectedLengthError:
            raise ValueError(
                "There were more than one file in this workbatch, "
                "when it's expected to be only one! "
                "file-handle : {}".format(file_handle))
        if not file_model:
            raise ValueError(
                "There were no file in this workbatch, "
                "file-handle: {}".format(file_handle))
        return WorkBatchFile(file_model)

    @property
    def status(self):
        return self._archetype.status

    @status.setter
    def status(self, value):
        self._archetype.status = value

    @property
    def work_units(self):
        return self._archetype.work_units

    @work_units.setter
    def work_units(self, value):
        self._archetype.work_units = value

    @property
    def transitions(self):
        return self._archetype.transitions.all()


class Button(namedtuple("Button", ['name', 'caption'])):
    pass


class Field(namedtuple("Field", ["type", "caption", "prop_name"])):
    pass


class WorkBatchFile(object):
    def __init__(self, work_batch_file_model):
        self.archetype = work_batch_file_model

    @property
    def contents(self):
        with self.archetype.file.getfile() as fp:
            c = fp.read()
        return c

    @property
    def file_stream(self):
        return self.archetype.file.getfile()

    @property
    def name(self):
        return self.archetype.name


class WorkBatchQueryBuilder(BaseQueryBuilder):
    def parse_params_for_class(self, key, val):
        query_params = {}
        if key == "workbatch.name":
            query_params['name__icontains'] = val
        else:
            raise NotImplementedError("The key {} is not implemented".format(key))
        return query_params


class Hook(namedtuple('Hook', ['callable', 'hook_tag'])):
    pass
