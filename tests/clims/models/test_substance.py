from __future__ import absolute_import

import random

import pytest
from clims.models import Substance, SubstanceVersion
from clims.services import ExtensibleTypeValidationError
from sentry.testutils import TestCase
from tests.fixtures.plugins.gemstones_inc.models import GemstoneSample


class SubstanceTestCase(TestCase):
    def create_gemstone(self, *args, **kwargs):
        return self.create_substance(GemstoneSample, *args, **kwargs)

    def register_gemstone_type(self):
        return self.register_extensible(GemstoneSample)


class SubstancePropertiesTestCase(TestCase):

    def test_can_create_substance_with_properties(self):
        from clims.services.substance import SubstanceBase, FloatField
        from clims.models.plugin_registration import PluginRegistration
        from sentry.models.organization import Organization

        org = Organization.objects.get(name="lab")

        example_plugin, _ = PluginRegistration.objects.get_or_create(
            name='clims.example.plugin', version='1.0.0', organization=org)

        class ExampleSample(SubstanceBase):
            moxy = FloatField("moxy")
            cool = FloatField("cool")
            erudite = FloatField("erudite")

        moxy = random.randint(1, 100)
        cool = random.randint(1, 100)
        erudite = random.randint(1, 100)

        self.app.extensibles.register(example_plugin, ExampleSample)
        name = "sample-{}".format(random.randint(1, 1000000))
        sample = ExampleSample(name=name,
                               organization=org,
                               moxy=moxy,
                               cool=cool,
                               erudite=erudite)
        sample.save()

        fetched_sample = self.app.substances.get(name=sample.name)
        fetched_sample.moxy == moxy
        fetched_sample.cool == cool
        fetched_sample.erudite == erudite


class TestSubstance(SubstanceTestCase):
    def test_can_create_substance(self):
        substance = self.create_gemstone()
        assert substance.version == 1

    def test_update_name_updates_version(self):
        substance = self.create_gemstone()
        assert substance.version == 1
        substance.name = substance.name + "!!!"
        substance.save()
        assert substance.version == 2

    def test_update_name_saves_previous_name(self):
        substance = self.create_gemstone()
        original_name = substance.name
        substance.name = substance.name + "-UPDATED"
        substance.save()

        model = Substance.objects.get(id=substance.id)
        actual = {(entry.version, entry.previous_name) for entry in model.versions.all()}
        expected = {(1, None), (2, original_name)}
        assert actual == expected

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
            assert substance._wrapped is not None
            assert substance.version == 1
            assert {key: prop.value for key, prop in substance.properties.items()} == props

        # Assert we get the expected results on the object
        do_asserts(substance)

        # ... as well as on the object freshly fetched from the db
        fresh_substance = Substance.objects.get(name=substance.name)
        do_asserts(self.app.substances.to_wrapper(fresh_substance))

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
                for s in SubstanceVersion.objects.filter(substance_id=substance.id)]

        actual = {v.version: props_to_dict(v.properties) for v in versions}
        expected = {1: {u'color': u'red', u'preciousness': u'*o*'},
                    2: {u'color': u'red', u'preciousness': u'*O*'}}
        assert actual == expected

    def test_can_create_json_value(self):
        payload = {"extra_val": 10}
        original = self.create_gemstone()
        original.payload = payload
        original.save()

        fetched = Substance.objects.get(name=original.name)
        fetched = self.app.substances.to_wrapper(fetched)
        assert fetched.payload == payload

    def test_can_get_all_substances(self):
        # There are two ways to get the substance, either query Substance.objects.all()
        # or use the substances service.
        sample = self.create_gemstone(color='red')
        result1 = {s.name for s in self.app.substances.all()}
        assert sample.name in result1
        result2 = {self.app.substances.to_wrapper(s).name for s in Substance.objects.all()}
        assert result1 == result2

    def test_can_get_substance_by_name(self):
        sample = self.create_gemstone(color='red')
        same = self.app.substances.get(name=sample.name)

        assert same._wrapped.id == sample._wrapped.id
        assert same.name == sample.name
        assert same.color == sample.color

    def test_get_expected_name(self):
        sample = self.create_gemstone(color='red')
        sub = Substance.objects.get(name=sample.name)
        assert sub.name == sample.name

    def test_can_update_substance(self):
        sample = self.create_gemstone(color='red')
        assert sample.color == "red"

        retrieved = self.app.substances.get(sample.name)
        assert retrieved.color == "red"

        sample.color = "blue"
        assert sample.color == "blue"
        sample.save()
        retreived = self.app.substances.get(sample.name)
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

    def test_assigning_float_to_int_field_succeeds_if_not_lossy(self):
        sample = self.create_gemstone(color='red')
        sample.weight = 10.0

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
