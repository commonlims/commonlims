from __future__ import absolute_import

from tests.clims.models.test_substance import SubstanceTestCase


class TestSubstance(SubstanceTestCase):
    def test_can_render_substance_graph(self):
        sample1 = self.create_gemstone()  # sample1.v1
        original_id = sample1.id
        assert (sample1.id, sample1.version) == (original_id, 1)  # sample1.v1

        aliquot1 = sample1.create_child()  # aliquot1.v1 (from sample1.v1)
        aliquot1_id = aliquot1.id
        assert (aliquot1.id, aliquot1.version) == (aliquot1_id, 1)  # aliquot1.v1

        sample1.color = 'red'
        sample1.save()
        assert (sample1.id, sample1.version) == (original_id, 2)  # sample1.v2

        sample1.color = 'blue'
        sample1.save()
        assert (sample1.id, sample1.version) == (original_id, 3)  # sample1.v3

        aliquot2 = sample1.create_child()
        assert aliquot2.version == 1
        assert len(aliquot2.parents) == 1
        assert (aliquot2.parents[0].id, aliquot2.parents[0].version) == (original_id, 3)

        ancestry = sample1.to_ancestry()  # returns everything with the same origins (i.e. sample1)
        ancestry.to_graphviz_src()
        ancestry.to_svg()
