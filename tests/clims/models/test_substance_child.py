from __future__ import absolute_import
import pytest
from clims.models import Substance
from tests.clims.models.test_substance import SubstanceTestCase
from tests.fixtures.plugins.gemstones_inc.models import GemstoneContainer


class TestSubstanceParentChild(SubstanceTestCase):
    def setUp(self):
        self.has_context()

    def test_can_find_parent_from_child(self):
        sample = self.create_gemstone()
        child = sample.create_child()
        child.save()
        assert {(sample.id, sample.version)} == {(p.id, p.version) for p in child.parents}

    def test_original_substance_has_no_parent(self):
        sample = self.create_gemstone()
        assert len(sample.parents) == 0

    @pytest.mark.dev_edvard
    def test_can_add_child_to_new_container(self):
        # Arrange
        parent = self.create_gemstone(name='parent')
        parent_container = self.create_container(GemstoneContainer, name='parent_container')
        parent_container.append(parent)
        parent_container.save()
        assert parent.location is not None
        child = parent.create_child(name='child')
        child_container = self.create_container(GemstoneContainer, name='child-container')
        child_container.append(child)
        child_container.save()
        contents = list(child_container.contents)
        print(contents[0].name)
        print(child_container._locatables)
        assert child.location is not None

    def test_children_get_increased_depth(self):
        original = self.create_gemstone()
        child = original.create_child()
        assert original.depth == 1
        assert child.depth == 2

    def test_creating_child_retains_props_by_default(self):
        # Creating a child from a substance (e.g. an aliquot from a sample) should retain
        # all properties, unless specified. This leads to new properties being
        # created, but they all point to the exact same values
        props = dict(preciousness='*o*', color='red')
        parent = self.create_gemstone(**props)

        # When copying, we specify the props that change:
        child = parent.create_child()

        original_prop_vals = set(parent.properties.values())
        child_prop_vals = set(child.properties.values())

        assert original_prop_vals == child_prop_vals

    def test_simple_child_gets_specific_prop(self):
        props = dict(preciousness='*o*', color='red')
        parent = self.create_gemstone(**props)
        child = parent.create_child()
        assert child.preciousness == '*o*'
        assert child.color == 'red'

    def test_creating_child_can_override_props(self):
        props = dict(preciousness='*o*', color='red')
        parent = self.create_gemstone(**props)
        child = parent.create_child(preciousness=':(')

        original_prop_vals = set(prop.value for prop in parent.properties.values())
        child_prop_vals = set(prop.value for prop in child.properties.values())

        assert original_prop_vals.symmetric_difference(child_prop_vals) == {u'*o*', u':('}
        assert original_prop_vals.intersection(child_prop_vals) == {u'red'}

    def test_creating_child_overriding_with_none_removes_value(self):
        parent = self.create_gemstone(color='red')
        child = parent.create_child(color=None)
        assert len(child.properties) == 0

    def test_can_add_props_when_creating_child(self):
        parent = self.create_gemstone(color='red')
        child = parent.create_child(preciousness='awesome')
        assert len(child.properties) == 2

    def test_overriding_with_the_same_value_is_a_noop(self):
        # Here we want to make sure that sending in a value doesn't lead to a new ExtensibleProperty
        # being created
        parent = self.create_gemstone(color='red')
        child = parent.create_child(color='red')
        assert parent.properties == child.properties
        parent_prop_ids = {entry.id for entry in parent._wrapped_version.properties.all()}
        child_prop_ids = {entry.id for entry in child._wrapped_version.properties.all()}
        assert parent_prop_ids == child_prop_ids

    def test_children_are_automatically_named(self):
        parent = self.create_gemstone()
        child = parent.create_child()
        assert child.name.startswith(parent.name)
        assert child.name != parent.name

    def test_child_has_correct_parent(self):
        parent = self.create_gemstone()
        child = parent.create_child()

        def do_asserts(child):
            assert len(child.parents) == 1
            assert child.parents[0].id == parent.id

        do_asserts(child)
        # Assert the same is true if we fetch the child by name:
        child = self.app.substances.to_wrapper(Substance.objects.get(name=child.name))
        do_asserts(child)

    def test_can_get_ancestry_from_substance(self):
        sample = self.create_gemstone()
        child = sample.create_child()
        child.save()
        grandchild = child.create_child()
        grandchild.save()

        relatives = [sample, child, grandchild]
        expected = {entry.id for entry in relatives}

        for member in relatives:
            actual = {entry.id for entry in member.to_ancestry().items()}
            assert expected == actual

    def test_children_retain_origin(self):
        original = self.create_gemstone()
        child = original.create_child()
        assert child.origins == [original.id]

        # a few years later...
        grandchild = child.create_child()
        assert grandchild.origins == child.origins
