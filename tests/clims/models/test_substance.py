from __future__ import absolute_import

import random
import pytest
import uuid
from sentry.testutils import TestCase
from clims.models import Substance, SubstanceVersion
from clims.services import ExtensibleTypeValidationError
from clims.services.substance import SubstanceBase
from clims.services.extensible import FloatField
from clims.services.extensible import TextField
from django.db import IntegrityError
from tests.fixtures.plugins.gemstones_inc.models import \
    GemstoneSample, GemstoneContainer, GemstoneProject


class SubstanceTestCase(TestCase):
    # Expose these types to the testcase so imports are not required
    GemstoneSample = GemstoneSample
    GemstoneContainer = GemstoneContainer
    GemstoneProject = GemstoneProject

    def setUp(self):
        self.register_extensible(GemstoneSample)
        self.register_extensible(GemstoneContainer)

    def create_gemstone(self, *args, **kwargs):
        self.user
        return self.create_substance(GemstoneSample, *args, **kwargs)

    def create_gemstone_container(self, *args, **kwargs):
        return self.create_container(GemstoneContainer, *args, **kwargs)

    def create_gemstone_project(self, *args, **kwargs):
        return self.create_clims_project(GemstoneProject, *args, **kwargs)

    def register_gemstone_type(self):
        return self.register_extensible(GemstoneSample)


class SubstancePropertiesTestCase(TestCase):
    def setUp(self):
        self.register_extensible(ExampleSample)
        self.has_context()

    def test_can_create_substance_with_properties(self):
        moxy = random.randint(1, 100)
        cool = random.randint(1, 100)
        erudite = random.randint(1, 100)

        name = "sample-{}".format(random.randint(1, 1000000))
        sample = ExampleSample(name=name,
                               moxy=moxy,
                               cool=cool,
                               erudite=erudite)
        sample.save()

        fetched_sample = self.app.substances.get(name=sample.name)
        assert fetched_sample.moxy == moxy
        assert fetched_sample.cool == cool
        assert fetched_sample.erudite == erudite

    def test_can_set_and_get_properties_of_substance(self):
        moxy = random.randint(1, 100)
        cool = random.randint(1, 100)
        erudite = random.randint(1, 100)

        name = "sample-{}".format(random.randint(1, 1000000))
        sample = ExampleSample(name=name,
                               moxy=moxy,
                               cool=cool,
                               erudite=erudite)
        sample.save()

        assert sample.moxy == moxy
        assert sample.erudite == erudite
        assert sample.cool == cool

    def test_can_create_substance_with_property_set_to_none(self):
        name = "sample-{}".format(random.randint(1, 1000000))
        cool = random.randint(1, 100)
        erudite = random.randint(1, 100)

        sample = ExampleSample(name=name,
                               moxy=None,
                               cool=cool,
                               erudite=erudite)
        sample.save()

        fetched_sample = self.app.substances.get(name=sample.name)
        assert fetched_sample.moxy is None
        assert fetched_sample.cool == cool
        assert fetched_sample.erudite == erudite

    def test_set_text_property_to_none__with_nullable_field__it_works(self):
        name = "sample-{}".format(random.randint(1, 1000000))

        sample = ExampleSample(name=name)
        sample.mox_feeling = None
        sample.save()

        fetched_sample = self.app.substances.get(name=sample.name)
        assert fetched_sample.mox_feeling is None

    def test_set_text_property_to_none__with_not_nullable_field__exception(self):
        name = "sample-{}".format(random.randint(1, 1000000))

        # TODO: what should the expected behaviour for not-nullable fields be?
        # Here, the cool_feeling can be omitted in the constructor, and then
        # the sample can be saved. When trying to get value of sample.cool_feeling,
        # a very non-descriptive error message shows.
        sample = ExampleSample(name=name)
        with pytest.raises(ExtensibleTypeValidationError):
            sample.cool_feeling = None

    def test_cannot_create_substance_with_property_set_to_none_unless_nullable(self):
        name = "sample-{}".format(random.randint(1, 1000000))
        cool = random.randint(1, 100)

        with pytest.raises(ExtensibleTypeValidationError):
            ExampleSample(name=name,
                          moxy=None,
                          cool=cool,
                          erudite=None)


class TestSubstance(SubstanceTestCase):
    def setUp(self):
        self.has_context()

    def test_can_create_substance(self):
        substance = self.create_gemstone()
        assert substance.version == 1

    def test_update_name_updates_version(self):
        substance = self.create_gemstone()
        assert substance.version == 1
        substance.name = substance.name + "!!!"
        substance.save()
        assert substance.version == 2

    def test_update_name_saves_versioned_name(self):
        substance = self.create_gemstone()
        original_name = substance.name
        substance.name = substance.name + "-UPDATED"
        substance.save()

        model = Substance.objects.get(id=substance.id)
        actual = {(entry.version, entry.name) for entry in model.versions.all()}
        expected = {(1, original_name), (2, substance.name)}
        assert actual == expected

    def test_update_name__the_new_name_is_searchable(self):
        # Arrange
        substance = self.create_gemstone()
        original_name = substance.name
        new_name = original_name + '-UPDATED'
        substance.name = new_name
        substance.save()

        # Act
        # fetched = self.app.substances.get_by_name(original_name)

        fetched = self.app.substances.get_by_name(new_name)

        # Assert
        assert fetched.name == new_name

    def test_names_are_unique(self):
        substance = self.create_gemstone()
        with pytest.raises(IntegrityError):
            substance = self.create_gemstone(name=substance.name)

    def test_can_save_substance_properties(self):
        """
        Saving a property through the related substance should increase the version
        of the substance by one and set the version of the property accordingly.

        It should also leave the old property unchanged
        """

        # NOTE: One must change substances via the service rather than the django
        # objects if all business rules are to be respected

        props = {
            'preciousness': ':o',
            'color': 'red'
        }
        substance = self.create_gemstone(**props)

        def do_asserts(substance):
            assert substance._archetype is not None
            assert substance.version == 1
            assert {key: prop.value for key, prop in substance.properties.items()} == props

        # Assert we get the expected results on the object
        do_asserts(substance)

        # ... as well as on the object freshly fetched from the db
        fresh_substance = Substance.objects.get(name=substance.name)
        do_asserts(self.app.substances.to_wrapper(fresh_substance))

    def test_create_combined_sample__from_two_childs__origins_of_combined_are_original_samples(self):
        # Arrange
        props = dict(preciousness='*o*', color='red')
        sample1 = self.create_gemstone(**props)
        sample2 = self.create_gemstone(**props)
        child1 = sample1.create_child()
        child2 = sample2.create_child()

        # Act
        combined = GemstoneSample(
            name='combined1',
            parents=[child1, child2])
        combined.save()

        # Assert
        assert len(combined.origins) == 2
        assert set(combined.origins) == {sample1.id, sample2.id}

    def test_set_property_for_combined_sample__fetched_object_from_db_ok(self):
        # Arrange
        props = dict(preciousness='*o*', color='red')
        substance1 = self.create_gemstone(**props)
        substance2 = self.create_gemstone(**props)

        # Act
        combined = GemstoneSample(
            name='combined1',
            parents=[substance1, substance2])
        combined.preciousness = 'xxx'
        combined.save()

        # Assert
        fetched = self.app.substances.get(name='combined1')

        assert 'xxx' == fetched.preciousness
        assert 2 == len(fetched.parents)

    def test_depth__with_multiple_parents_with_different_depths__new_depth_based_on_highest(self):
        # I just picked a policy for this, I had to choose something
        # Arrange
        props = dict(preciousness='*o*', color='red')
        substance1 = self.create_gemstone(**props)
        substance1._archetype.depth = 4
        substance1.save()
        substance2 = self.create_gemstone(**props)

        # Act
        combined = GemstoneSample(
            name='combined1',
            parents=[substance1, substance2])
        combined.save()

        # Assert
        assert substance1.depth == 4
        assert substance2.depth == 1
        assert combined.depth == 5

    def test_updating_properties_via_update_or_create_updates_version(self):
        props = dict(preciousness='*o*', color='red')
        substance = self.create_gemstone(**props)

        def props_to_dict(props):
            # NOTE: We are often mapping back to dict for the props. Might be good to allow
            # equality checks against a dict, or just return a dict in extensible.properties
            return {key: prop.value for key, prop in props.items()}

        assert substance.version == 1
        assert props_to_dict(substance.properties) == props

        substance.preciousness = '*O*'
        substance.save()

        # 1. Assert that the in-memory version has the expected values:
        assert props_to_dict(substance.properties) == dict(preciousness='*O*', color='red')

        # 2. Assert that we get the expected values for all versions when querying the backend:

        # TODO: substances service should return this instead
        versions = [self.app.substances.to_wrapper(s)
                for s in SubstanceVersion.objects.filter(archetype_id=substance.id)]

        actual = {v.version: props_to_dict(v.properties) for v in versions}
        expected = {1: {u'color': u'red', u'preciousness': u'*o*'},
                    2: {u'color': u'red', u'preciousness': u'*O*'}}
        assert actual == expected

    def test_can_create_json_value(self):
        payload = {"extra_val": 10}
        original = self.create_gemstone()
        original.payload = payload
        original.save()

        fetched = self.app.substances.get_by_name(original.name)
        assert fetched.payload == payload

    def test_can_get_all_substances(self):
        # There are two ways to get the substance, either query Substance.objects.all()
        # or use the substances service. The latter should always be used except in core code.
        sample = self.create_gemstone(color='red')
        result1 = {s.name for s in self.app.substances.all()}
        assert sample.name in result1
        result2 = {self.app.substances.to_wrapper(s).name for s in Substance.objects.all()}
        assert result1 == result2

    def test_can_get_substance_by_name(self):
        sample = self.create_gemstone(color='red')
        same = self.app.substances.get(name=sample.name)

        assert same._archetype.id == sample._archetype.id
        assert same.name == sample.name
        assert same.color == sample.color

    def test_get_expected_name(self):
        sample = self.create_gemstone(color='red')
        sub = Substance.objects.get(name=sample.name)
        assert sub.name == sample.name

    def test_can_update_substance(self):
        sample = self.create_gemstone(color='red')
        assert sample.color == "red"

        retrieved = self.app.substances.get(name=sample.name)
        assert retrieved.color == "red"

        sample.color = "blue"
        assert sample.color == "blue"
        sample.save()
        retreived = self.app.substances.get(name=sample.name)
        assert retreived.color == "blue"

    def test_assigning_int_to_string_field_fails(self):
        sample = self.create_gemstone(color='red')
        with pytest.raises(ExtensibleTypeValidationError):
            sample.color = 10

    def test_assigning_string_to_int_field_fails(self):
        sample = self.create_gemstone(color='red')
        with pytest.raises(ExtensibleTypeValidationError):
            sample.index = "test"

    def test_assigning_string_to_float_field_fails(self):
        sample = self.create_gemstone(color='red')
        with pytest.raises(ExtensibleTypeValidationError):
            sample.weight = "test"

    def test_assigning_int_to_float_field_succeeds(self):
        sample = self.create_gemstone(color='red')
        sample.weight = 10

    @pytest.mark.dev_edvard
    def test_assign_zero_to_int_field_succeeds(self):
        sample = self.create_gemstone()
        sample.weight = 0

    def test_assign_zero_to_float_field_succeeds(self):
        sample = self.create_gemstone()
        sample.volume = 0

    def test_assign_false_to_int_field_fails(self):
        sample = self.create_gemstone()
        with pytest.raises(ExtensibleTypeValidationError):
            sample.weight = False

    def test_assign_false_to_float_field_fails(self):
        sample = self.create_gemstone()
        with pytest.raises(ExtensibleTypeValidationError):
            sample.volume = False

    def test_assigning_float_to_int_field_succeeds_if_not_lossy(self):
        sample = self.create_gemstone(color='red')
        sample.weight = 10.0

    def test_assigning_bool_to_bool_field_succeeds(self):
        sample = self.create_gemstone(color='red')
        sample.has_something = True

    def test_assigning_string_to_bool_field_fails(self):
        sample = self.create_gemstone(color='red')
        with pytest.raises(ExtensibleTypeValidationError):
            sample.has_something = 'True'

    def test_assigning_int_to_bool_field_fails(self):
        sample = self.create_gemstone(color='red')
        with pytest.raises(ExtensibleTypeValidationError):
            sample.has_something = 1

    def test_assigning_float_to_int_field_fails_if_lossy(self):
        sample = self.create_gemstone(color='red')
        with pytest.raises(ExtensibleTypeValidationError):
            sample.weight = 10.5

    def test_can_iterate_through_all_versions_given_an_object(self):
        sample = self.create_gemstone(color='red')
        sample.color = 'blue'
        sample.save()

        versions = [(s.version, s.properties) for s in sample.iter_versions()]
        assert len(versions) == 2

    def test_fetch_property_after_instansiation__no_db_calls(self):
        # Arrange
        from django.db import connection
        from django.db import reset_queries
        from django.conf import settings
        old_debug = settings.DEBUG
        settings.DEBUG = True
        sample = self.create_gemstone()
        sample.color = 'red'
        sample.save()

        fetched_sample = self.app.substances.get(name=sample.name)
        reset_queries()

        # Act
        color = fetched_sample.color

        # Assert
        assert color == 'red'
        assert len(connection.queries) == 0
        settings.DEBUG = old_debug

    def test_fetch_non_existent_property__attribute_error(self):
        sample = self.create_gemstone(color='red')
        with pytest.raises(AttributeError):
            sample.blurr

    def test_get_substance__with_two_versions_and_latest_version_true__latest_version_fetched(self):
        # Arrange
        sample = self.create_gemstone()
        sample.color = 'red'
        sample.save()

        # Act
        fetched_sample = self.app.substances.get(name=sample.name, latest=True)

        # Assert
        assert fetched_sample.name == sample.name
        assert sample.version == 2
        assert fetched_sample.version == sample.version

    def test_get_substance__with_two_versions_and_latest_omitted__latest_version_fetched(self):
        # Arrange
        sample = self.create_gemstone()
        sample.color = 'red'
        sample.save()

        # Act
        fetched_sample = self.app.substances.get(name=sample.name)

        # Assert
        assert fetched_sample.name == sample.name
        assert sample.version == 2
        assert fetched_sample.version == sample.version

    def test_filter_substance__with_3_versions_and_latest_version_false__2_instances_fetched(self):
        # Arrange
        sample = self.create_gemstone()
        sample.color = 'red'
        sample.save()
        sample.color = 'yellow'
        sample.save()

        # Act
        fetched_samples = self.app.substances.filter(name=sample.name, latest=False)

        # Assert
        assert len(fetched_samples) == 2

    def test_get_current_position_from_substance(self):
        container = self.create_container_with_samples(GemstoneContainer, GemstoneSample)
        first = container["a1"]
        # Now, we expect the position to point to the same container:
        # TODO: location should be a ContainerIndex that makes sense for GemstoneContainer
        #       Then it would be enough to check first.location == "a1" and we could return
        #       this directly to the frontend
        assert (first.location.x, first.location.y, first.location.z) == (0, 0, 0)

    def test_location_is_set_twice__location_is_still_accessible(self):
        # This test was created after a bugfix
        container = self.create_container_with_samples(GemstoneContainer, GemstoneSample)
        first = container["a1"]
        new_position = (0, 1, 0)
        first.move(container, new_position)
        first.save()
        assert first.location is not None

    @pytest.mark.dev_edvard
    def test_location_changed_after_a_fetch__update_is_ok(self):
        container = self.create_container_with_samples(GemstoneContainer, GemstoneSample)
        first = container["a1"]
        fetched = self.app.substances.get_by_name(first.name)
        new_position = (0, 1, 0)
        fetched.move(container, new_position)
        fetched.save()
        assert str(fetched.location) == 'B:1'

    def test_set_same_location_twice__unique_location_entry_in_db(self):
        sample = self.create_gemstone()
        container = self.create_gemstone_container()
        new_position = (0, 0, 0)
        sample.move(container, new_position)
        sample.save()
        sample.move(container, new_position)
        sample.save()
        locations = sample._archetype.locations.filter()
        assert len(locations) == 1

    def test_with_no_display_name__default_display_name_is_shown(self):
        self.register_extensible(QuirkSample)
        ext_type_name = QuirkSample.type_full_name_cls()
        extensible_type = \
            self.app.extensibles.get_extensible_type(ext_type_name)
        quirkyness = extensible_type.property_types.get(name='quirkyness')

        assert quirkyness.display_name == 'quirkyness'

    def test_with_explicitly_set_display_name__display_name_is_shown(self):
        extensible_type = self.register_extensible(QuirkSample)
        squirkyness = extensible_type.property_types.get(name='squirkyness')

        assert squirkyness.display_name == 'The Squirkyness Display Value'

    def test__with_sample_has_no_container__location_is_none(self):
        # Arrange
        self.register_extensible(QuirkSample)
        sample = QuirkSample(
            name='sample-{}'.format(uuid.uuid4()))

        # Act
        location = sample.location

        # Assert
        assert location is None


class ExampleSample(SubstanceBase):
    moxy = FloatField("moxy")
    cool = FloatField("cool")
    erudite = FloatField("erudite", nullable=False)
    mox_feeling = TextField()
    cool_feeling = TextField(nullable=False)


class QuirkSample(SubstanceBase):
    quirkyness = TextField()
    squirkyness = TextField(display_name='The Squirkyness Display Value')
