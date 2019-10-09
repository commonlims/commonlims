from __future__ import absolute_import

import six
import re
import logging

from clims.models import Substance, ExtensibleProperty, ExtensiblePropertyType, SubstanceVersion
from clims.services.extensible import (ExtensibleBase, ExtensibleBaseField,
        ExtensibleTypeValidationError)
from django.db import transaction
from django.db.models import QuerySet
from uuid import uuid4
from sentry.models.file import File
from clims.models.file import OrganizationFile


class ExtensibleBaseQuerySet(QuerySet):
    pass


class RequiredHandlerNotFound(Exception):
    pass


class FileNameValidationError(Exception):
    pass


FILENAME_RE = re.compile(r"[\n\t\r\f\v\\]")


class SubstanceService(object):
    """
    Provides an API for dealing with both substances (samples, aliquots etc.)
    and their associated containers.

    Plugins change the state of the system only via service classes or REST API
    calls. Access to lower-level APIs is possible, but not suggested to ensure
    backwards compatibility and business rule constraints.

    NOTE: Use this class instead of the manager on Substance even in framework code (unless
    you're sure of what you're doing) because interaction of the substance and its properties must
    be strictly maintained.
    """

    def __init__(self, app):
        self._app = app

    def all(self):
        """
        Returns all instances of a substance. Only the latest version is
        returned.
        """
        # TODO: We should filter by organization

        # TODO: It would be preferable if we could return a regular django queryset here,
        # which in turn would return the wrapper when materialized. For that to work smoothly,
        # we'll need to look into implementation details of django querysets.

        # TODO: how does the prefetch perform when fetching all objects like this
        for entry in self.all_qs():
            yield self.to_wrapper(entry)

    def all_qs(self):
        """Returns a queryset for all substances of a particular version or latest if nothing
        is supplied

        Note that you must call SubstanceService.to_wrapper to wrap it as a high level object.
        """

        # TODO: `all` should return a queryset that automatically wraps the Django object and
        # after that we can remove methods named `*_qs`.

        return SubstanceVersion.objects.filter(latest=True).prefetch_related('properties')

    @transaction.atomic
    def load_file(self, organization, full_path, fileobj):
        from sentry.plugins import plugins
        from clims.handlers import SubstancesSubmissionHandler, HandlerContext
        submission_handlers = plugins.handlers[SubstancesSubmissionHandler]
        if len(submission_handlers) == 0:
            raise RequiredHandlerNotFound("No handler that supports substance submission found")
        logger = logging.getLogger('clims.files')
        logger.info('substance_batch_import.start')

        name = full_path.rsplit('/', 1)[-1]
        if FILENAME_RE.search(name):
            raise FileNameValidationError('File name must not contain special whitespace characters')

        file_model = File.objects.create(
            name=name,
            type='substance-batch-file',
            headers=list(),
        )
        file_model.putfile(fileobj, logger=logger)

        org_file = OrganizationFile.objects.create(
            organization_id=organization.id,
            file=file_model,
            name=full_path,
        )

        # Call handler synchronously:
        for handler in submission_handlers:
            context = HandlerContext(organization=organization)
            instance = handler(context, self._app)
            instance.handle(org_file)

    def to_wrapper(self, model):
        if isinstance(model, SubstanceVersion):
            return self._app.substances.substance_version_to_wrapper(model)
        elif isinstance(model, Substance):
            return self._app.substances.substance_to_wrapper(model)

    def substance_version_to_wrapper(self, substance_version):
        from clims.services import SubstanceBase
        from clims.services.extensible import ExtensibleTypeNotRegistered

        try:
            SpecificExtensibleType = self._app.extensibles.get_implementation(
                substance_version.substance.extensible_type.name)
            return SpecificExtensibleType(_wrapped_version=substance_version, _app=self._app)
        except ExtensibleTypeNotRegistered:
            # This is an unregistered instance. This can happen for example when we have
            # an instance that used to be registered but the Python version has been removed
            # or rename.d
            # We must use the base class to wrap it:
            return SubstanceBase(_wrapped_version=substance_version, _unregistered=True)

    def substance_to_wrapper(self, substance, version=None):
        if version is not None:
            versioned = substance.versions.get(version=version)
        else:
            versioned = substance.versions.get(latest=True)
        return self.substance_version_to_wrapper(versioned)

    def filter(self, *args, **kwargs):
        pass

    def get(self, name):
        substance_model = SubstanceVersion.objects.prefetch_related('properties').get(
            substance__name=name, latest=True)
        return self.to_wrapper(substance_model)


class _PropertyBag(object):
    """
    Handles properties on an extensible object.
    """

    def __init__(self, extensible_wrapper):
        # TODO: validation should happen here
        # TODO: Move versioning of properties here from the service
        self.extensible_wrapper = extensible_wrapper
        self.new_values = dict()

    def save(self, versioned_object):
        """
        Saves the properties to django objects. Must be called after the wrapped class
        has been saved.
        """
        # TODO: Make sure we're not trying to save to a "latest" entry
        if not self.extensible_wrapper.id:
            raise AssertionError(
                "Properties can't be saved before the extensible object has been saved")

        def create(key, value):
            prop_type = versioned_object.substance.extensible_type.property_types.get(name=key)
            prop = ExtensibleProperty(extensible_property_type=prop_type)
            prop.value = value
            prop.save()
            versioned_object.properties.add(prop)

        def update(key, value, old_prop):
            # Then, create a new entry with the new value with the same version
            # as the current substance object
            prop_type = versioned_object.substance.extensible_type.property_types.get(name=key)
            prop = ExtensibleProperty(extensible_property_type=prop_type)
            prop.value = value
            prop.save()
            versioned_object.properties.remove(old_prop)
            versioned_object.properties.add(prop)

        for key, value in self.new_values.items():
            try:
                prop = versioned_object.properties.get(extensible_property_type__name=key)
                if prop.value == value:
                    continue
                update(key, value, prop)
            except ExtensibleProperty.DoesNotExist:
                create(key, value)

        self.new_values.clear()

    def __getitem__(self, key):
        try:
            new_value = self.new_values.get(key, None)
            if new_value:
                return new_value
            persisted_value = self.extensible_wrapper._wrapped_version.properties.get(
                extensible_property_type__name=key)
            return persisted_value.value
        except ExtensibleProperty.DoesNotExist:
            return None

    def __setitem__(self, key, value):
        self.new_values[key] = value


def validate_with_casting(value, fn):
    valid = True
    try:
        cast = fn(value)
        if cast != value:
            valid = False
    except ValueError:
        valid = False

    if not valid:
        raise ExtensibleTypeValidationError(
            "Value can not be interpreted as '{}'".format(fn.__name__))


class IntField(ExtensibleBaseField):
    def validate(self, prop_type, value):
        validate_with_casting(value, int)

    @property
    def raw_type(self):
        # NOTE: Implemented as a property as the constant we're using lies in the models and
        # we can't load the models too soon. It would be nice to change this!
        return ExtensiblePropertyType.INT


class FloatField(ExtensibleBaseField):
    def validate(self, prop_type, value):
        validate_with_casting(value, float)

    @property
    def raw_type(self):
        return ExtensiblePropertyType.FLOAT


class TextField(ExtensibleBaseField):
    def validate(self, prop_type, value):
        if not isinstance(value, six.string_types):
            raise ExtensibleTypeValidationError("Expected string")

    @property
    def raw_type(self):
        return ExtensiblePropertyType.STRING


class JsonField(ExtensibleBaseField):
    def validate(self, prop_type, value):
        import json
        json.dumps(value)

    @property
    def raw_type(self):
        return ExtensiblePropertyType.JSON


class SubstanceAncestry(object):
    """
    A companion class to the `Substance` class. Used to visualize the substance's ancestry.
    """

    def __init__(self, substance):
        self.substance = substance

    def items(self):
        # Find out the origin nodes of the graph we are in. Note that substance graphs
        # can have 1..n origin nodes. An example of that is when you create a pool
        # from two original samples. There your pool's origin are the two original samples.

        # Now, to find all the nodes in the graph, we simply query for the origin nodes:
        for entry in Substance.objects.filter(origins__in=self.substance.origins):
            yield self.substance._to_wrapper(entry)

    def to_graphviz_src(self, include_created=True):
        """Generates a graphviz graph for the ancestry of this substance."""
        def create_node_id(substance_at_version):
            return "node_{}_v{}".format(substance_at_version.id, substance_at_version.version)

        def node(substance):
            node_id = create_node_id(substance)
            node_name = "{}.v{}".format(substance.name, substance.version)
            key_vals = list((key, prop.value) for key, prop in substance.properties.items())
            # Add created/updated
            if include_created:
                key_vals.append(("created", substance.created_at))

            keys = " | ".join(key for key, val in key_vals)
            vals = " | ".join(six.text_type(val) for key, val in key_vals)

            templ = "{ID} [shape=record,label=\"{{NAME} | {{ " + keys + " } | { " + vals + " }}}\"];"
            templ = templ.replace("{ID}", node_id)
            templ = templ.replace("{NAME}", node_name)
            return templ

        nodes = list()
        edges = list()

        # Create edges for parent/child relationships and versions
        for current in self.items():
            all_versions = {s.version: s for s in current.iter_versions()}
            for current_at_version in all_versions.values():
                nodes.append(node(current_at_version))

                # We show the parent-child relationship only at version 1, because when
                # we build a parent/child relationship, the child is always at version 1
                # by definition (because it's new)
                if current_at_version.version == 1:
                    for parent in current.parents:
                        edges.append("{} -> {}".format(
                            create_node_id(parent), create_node_id(current_at_version)))

            # Create an edge between versions:
            for ix in range(2, len(all_versions) + 1):
                edges.append("{} -> {} [style=dashed]".format(
                    create_node_id(all_versions[ix - 1]), create_node_id(all_versions[ix])))

        templ = ("digraph structs {\n"
                "  node [shape=record];\n"
                "{NODES}\n"
                "{EDGES}\n"
                "}")

        def format_lines(lines, indent):
            lines = [(" " * indent) + line for line in lines]
            return "\n".join(lines)

        nodes = format_lines(nodes, 6)
        edges = format_lines(edges, 6)

        return templ.replace("{NODES}", nodes).replace("{EDGES}", edges)

    def to_svg(self, include_created=True):
        from graphviz import Source
        s = Source(self.to_graphviz_src(include_created))
        return s


class SubstanceBase(ExtensibleBase):
    """
    A base object for defining substances in the system, e.g. Sample, Aliquot or Pool.

    Details:

    Under the hood, this object wraps a Substance object and its related Extensible* classes.
    """

    def __init__(self, **kwargs):
        super(SubstanceBase, self).__init__(**kwargs)

        from clims.services.application import ioc
        self._app = ioc.app

        self._property_bag = _PropertyBag(self)
        self._name_before_change = None

        wrapped_version = kwargs.get("_wrapped_version", None)
        if wrapped_version:
            self._wrapped_version = wrapped_version
            self._wrapped = wrapped_version.substance
            return

        name = kwargs.pop("name", None)
        org = kwargs.pop("organization", None)

        if not name or not org:
            raise AttributeError("You must supply name and organization")

        extensible_type = self._app.extensibles.get_extensible_type(org, self.type_full_name)
        self._wrapped = Substance(name=name, extensible_type=extensible_type, organization=org)
        self._wrapped_version = SubstanceVersion()

    def _to_wrapper(self, model):
        """
        Wraps either a SubstanceVersion or Substance as a higher-level object
        """
        return self._app.substances.to_wrapper(model)

    @property
    def version(self):
        return self._wrapped_version.version

    @property
    def organization(self):
        return self._wrapped.organization

    @property
    def extensible_type(self):
        return self._wrapped.extensible_type

    @property
    def depth(self):
        return self._wrapped.depth

    @property
    def origins(self):
        return [origin.id for origin in self._wrapped.origins.all()]

    @property
    def parents(self):
        """
        Returns the parents (of a particular version) of the substance, if there are any.
        """
        return [self._app.substances.substance_version_to_wrapper(parent)
                for parent in self._wrapped.parents.all()]

    def to_ancestry(self):
        return SubstanceAncestry(self)

    @transaction.atomic
    def save(self):
        creating = self.id is None
        if creating:
            self._wrapped.save()
            self._wrapped_version.substance = self._wrapped
            self._wrapped_version.save()

            # We want the origin point(s) to always be populated, also for the origins themselves, in
            # which case it points to itself. This way we can find all related samples in one query.
            self._wrapped_version.substance.origins.add(self._wrapped)
            self._property_bag.save(self._wrapped_version)
        else:
            # Updating
            old_version = self._wrapped.versions.get(latest=True)
            old_version.latest = False
            old_version.save()
            properties = old_version.properties.all()

            new_version = old_version
            new_version.pk = None
            new_version.version += 1
            new_version.latest = True
            new_version.previous_name = self._name_before_change
            new_version.save()

            # Connect the new object with the properties on the old_version
            for prop in properties:
                new_version.properties.add(prop)

            self._wrapped.versions.add(new_version)
            self._property_bag.save(new_version)
            self._wrapped_version = new_version

    def iter_versions(self):
        """
        Iterate through all versions of this sample
        """
        for version in self._wrapped.versions.order_by('version'):
            yield self._to_wrapper(version)

    @transaction.atomic
    def create_child(self, name=None, **kwargs):
        """
        Creates a child from this substance, giving it a name. If name is not supplied it
        will get a unique name based on the name of the parent.

        The child gets all the props that are in the parent, except if they are in kwargs, then
        kwargs overrides it. If the props are in kwargs but not in the parent, they should be set.
        """

        overridden_properties = kwargs
        parent_version = self._wrapped.versions.get(latest=True)

        if not name:
            name = "{}:{}".format(self.name, uuid4())

        child = Substance(
            name=name,
            organization=self.organization,
            extensible_type=self.extensible_type)
        child.depth = self.depth + 1
        child.save()
        version = SubstanceVersion(substance=child)
        version.save()

        # Origin points to the first ancestor(s) of this substance. If the substance being cloned
        # has origins, we'll get the same origins. Otherwise the substance being
        # cloned is the origin - in that case, it points to itself.

        for origin in self._wrapped.origins.all():
            child.origins.add(origin)

        child.parents.add(parent_version)

        for prop in parent_version.properties.all():
            if prop.name in overridden_properties:
                overridden_val = overridden_properties.pop(prop.name, None)
                if overridden_val == prop.value:
                    # Link to the existing property
                    version.properties.add(prop)
                elif overridden_val is None:
                    # Providing an override with value None means we don't add the prop to the child
                    pass
                else:
                    prop = ExtensibleProperty(extensible_property_type=prop.extensible_property_type)
                    prop.value = overridden_val
                    prop.save()
                    version.properties.add(prop)
            else:
                # Link to the existing property
                version.properties.add(prop)

        for key, val in overridden_properties.items():
            prop_type = child.extensible_type.property_types.get(name=key)
            prop = ExtensibleProperty(extensible_property_type=prop_type)
            prop.value = val
            prop.save()
            version.properties.add(prop)

        return self._app.substances.substance_to_wrapper(child)
