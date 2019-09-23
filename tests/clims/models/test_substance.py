from __future__ import absolute_import

import pytest
from clims.models import Substance
from tests.clims import testutils
from clims.services import substances
from django.db.models import FieldDoesNotExist
from random import random
from ...fixtures.plugins.gemstones_inc.models import GemstoneSample
from sentry.testutils import TestCase


class TestSubstance(TestCase):
    def setUp(self):
        self.org = testutils.create_organization()
        self.gemstone_sample_type = testutils.create_substance_type(org=self.org)

    def test_can_create_substance(self):
        substance = substances.create(
            name='gem-sample-001',
            extensible_type=self.gemstone_sample_type,
            organization=self.org)
        assert substance.version == 1

    def test_can_save_substance_properties(self):
        """
        Saving a property through the related substance should increase the version
        of the substance by one and set the version of the property accordingly.

        It should also leave the old property unchanged
        """
        props = {
            'preciousness': ':o',
            'color': 'red'
        }

        # NOTE: One must change substances via the service rather than the django objects if all
        # business rules are to be respected
        substance = substances.create(
            name='gem-sample-001',
            extensible_type=self.gemstone_sample_type,
            organization=self.org,
            properties=props)

        def do_asserts(substance):
            assert substance.version == 1
            assert len(substance.properties.all()) == 2
            key_value_set = {(prop.extensible_property_type.name, prop.value)
                             for prop in substance.properties.all()}
            expected_key_value_set = {item for item in props.items()}
            assert key_value_set == expected_key_value_set

        # Assert we get the expected results on the object
        do_asserts(substance)

        # ... as well as on the object freshly fetched from the db
        fresh_substance = Substance.objects.get(name='gem-sample-001')
        do_asserts(fresh_substance)

    def test_saving_an_unregistered_property_raises(self):
        props = dict(weirdness=1)

        with pytest.raises(FieldDoesNotExist):
            substances.create(
                name='gem-sample-001',
                extensible_type=self.gemstone_sample_type,
                organization=self.org,
                properties=props
            )

    def test_updating_properties_via_update_or_create_updates_version(self):
        props = dict(preciousness='*o*', color='red')

        substance = substances.create(
            name='gem-sample-001',
            extensible_type=self.gemstone_sample_type,
            organization=self.org,
            properties=props)

        assert substance.version == 1
        assert {prop.version for prop in substance.properties.all()} == {1}

        # NOTE: The high level link between substances and properties (where they are
        # versioned together) is (currently) only supported via the SubstanceService,
        # so it's not possible to change properties on the object we just created above.

        new_props = dict(preciousness='*O*')
        fresh_substance = substances.update(
            name='gem-sample-001',
            extensible_type=self.gemstone_sample_type,
            organization=self.org,
            properties=new_props)

        # Now, getting all the properties should mean we get 2 versions of preciousness
        # but one of color:
        vals = {(x.extensible_property_type.name, x.value, x.version, x.latest)
                for x in fresh_substance.properties.all()}
        expected_vals = {
            ('color', 'red', 1, True),
            ('preciousness', '*o*', 1, False),
            ('preciousness', '*O*', 2, True)
        }

        def do_asserts():
            assert vals == expected_vals
            assert fresh_substance.version == 2

        do_asserts()
        fresh_substance = Substance.objects.get(name='gem-sample-001')
        do_asserts()

    def test_creating_child_retains_props_by_default(self):
        # Creating a child from a substance (e.g. an aliquot from a sample) should retain
        # all properties, unless specified. This leads to new properties being
        # created, but they all point to the exact same values
        props = dict(preciousness='*o*', color='red')

        original = substances.create(
            name='gem-sample-001',
            extensible_type=self.gemstone_sample_type,
            organization=self.org,
            properties=props)

        # When copying, we specify the props that change:
        new_name = original.name + "-derived"
        child = substances.copy(original, new_name)

        # 1. All props should have the same value
        original_prop_vals = {x.value for x in original.properties.all()}
        childd_prop_vals = {x.value for x in child.properties.all()}

        assert original_prop_vals == childd_prop_vals

        # 2. ... but the ID of the properties should differ
        original_prop_ids = {x.id for x in original.properties.all()}
        childd_prop_ids = {x.id for x in child.properties.all()}

        assert original_prop_ids != childd_prop_ids, "Expecting new IDs for property objects"

    def test_creating_child_can_override_props(self):
        props = dict(preciousness='*o*', color='red')

        original = substances.create(
            name='gem-sample-001',
            extensible_type=self.gemstone_sample_type,
            organization=self.org,
            properties=props)

        new_name = original.name + "-derived"
        child = substances.copy(
            original, new_name, overridden_properties=dict(preciousness=':('))

        original_prop_vals = {x.value for x in original.properties.all()}
        childd_prop_vals = {x.value for x in child.properties.all()}

        assert original_prop_vals.symmetric_difference(childd_prop_vals) == {u'*o*', u':('}
        assert original_prop_vals.intersection(childd_prop_vals) == {u'red'}

    def test_can_create_json_value(self):
        payload = {"extra_val": 10}
        props = dict(payload=payload)

        original = substances.create(
            name='gem-sample-001',
            extensible_type=self.gemstone_sample_type,
            organization=self.org,
            properties=props)

        fetched = Substance.objects.get(name=original.name)
        payload = fetched.properties.get(extensible_property_type__name='payload')

        assert payload.value['extra_val'] == 10

    def test_children_are_automatically_named(self):
        original = testutils.create_substance()
        child = substances.copy(original)
        assert child.name.startswith(original.name)
        assert child.name != original.name

    def test_children_get_increased_depth(self):
        original = testutils.create_substance()
        child = substances.copy(original)
        assert original.depth == 1
        assert child.depth == 2

    def test_initial_substance_has_no_origins(self):
        original = testutils.create_substance()
        assert len(original.origins.all()) == 0

    def test_children_retain_origin(self):
        original = testutils.create_substance()
        child = substances.copy(original)

        assert child.origins.all()[0] == original

        child_of_child = substances.copy(child)
        assert [x.id for x in child_of_child.origins.all()] == [x.id for x in child.origins.all()]

    def test_child_has_parent(self):
        original = testutils.create_substance()
        child = substances.copy(original)

        def do_asserts(child):
            parents = child.parents.all()
            assert len(parents) == 1
            assert parents[0] == original

        do_asserts(child)
        # Assert the same is true if we fetch the child by name:
        child = Substance.objects.get(name=child.name)
        do_asserts(child)


class TestSubstanceHighLevel(TestCase):
    def setUp(self):
        self.org = testutils.create_organization()
        testutils.create_substance_type(
            name="tests.fixtures.plugins.gemstones_inc.models.GemstoneSample")

    def test_can_create_substance(self):
        # TODO: The user should not have to add the org. Would be added via some
        # context that's on the handler.
        sample = GemstoneSample("somename-{}".format(random()), self.org)
        sample.save()

        sub = Substance.objects.get(name=sample.name)
        assert sub.name == sample.name

    def test_can_add_substance_property(self):
        sample = GemstoneSample("somename-{}".format(random()), self.org)
        sample.color = "red"
        sample.save()

        sub = Substance.objects.get(name=sample.name)

        # Might seem obvious, but we're going via a descriptor, so this assert is important
        assert sample.color == "red"
        assert sub.name == sample.name
        props = sub.properties.all()
        assert len(props) == 1
        assert props[0].value == sample.color

    def test_assigning_incorrect_type_fails(self):
        sample = GemstoneSample("somename-{}".format(random()), self.org)
        sample.color = 10
        sample.save()
        sub = Substance.objects.get(name=sample.name)
        assert sample.name == sub.name
