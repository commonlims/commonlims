from __future__ import absolute_import
import pytest
from exam import before
from exam import after
from django.db import connection
from django.db import reset_queries
from django.conf import settings
from django.db.models import Prefetch
from sentry.testutils import TestCase
from clims.models.container import ContainerVersion
from tests.fixtures.plugins.gemstones_inc.models import GemstoneSample
from clims.services.container import PlateBase
from clims.services.extensible import TextField


class TestContainers(TestCase):
    @before
    def init_debug(self):
        self.old_debug = settings.DEBUG
        settings.DEBUG = True
        self.create_container_with_samples(
            HairSampleContainer, GemstoneSample, 'container1')
        self.create_container_with_samples(
            HairSampleContainer, GemstoneSample, 'container2')

    @after
    def reset_debug(self):
        settings.DEBUG = self.old_debug

    @pytest.mark.dev_edvard
    def test_fetch_containers__first_1_container_then_2__same_amount_of_db_calls_for_either_call(self):
        # Arrange
        reset_queries()
        container1_model = self.app.containers._expanded_search('container1')
        self.app.containers.to_wrapper(container1_model[0])
        db_calls1 = len(connection.queries)
        reset_queries()
        container_models = self.app.containers._expanded_search('container')
        wrapped_containers = list()
        for c in container_models:
            current = self.app.containers.to_wrapper(c)
            wrapped_containers.append(current)

        db_calls2 = len(connection.queries)
        assert db_calls1 == db_calls2

    def test_fetch_substance_after_instantiation__no_db_calls(self):
        # Arrange
        containers = self.app.containers._expanded_search('container')
        first = containers[0]
        reset_queries()

        # Act
        locations = first.archetype.prefetched_locations
        substance = locations[0].substance
        versions = substance.prefetched_versions
        substance_version = versions[0]

        # Assert
        assert substance.name.startswith('sample')
        assert substance_version.latest is True
        assert len(versions) == 1
        assert len(connection.queries) == 0

    def test_wrap_container_from_raw_model__no_db_calls(self):
        # Arrange
        containers = self.app.containers._expanded_search('container')
        first = containers[0]
        reset_queries()

        # Act
        wrapped_container = self.app.containers.to_wrapper(first)

        from pprint import pprint
        pprint(connection.queries)
        # Assert
        assert wrapped_container.name.startswith('container')
        assert wrapped_container._wrapped_version.latest is True
        assert len(connection.queries) == 0

    def test_wrap_sample_from_raw_model__which_is_fetched_from_container__no_db_calls(self):
        # Arrange
        containers = self.app.containers._expanded_search('container')
        first = containers[0]
        reset_queries()

        # Act
        wrapped_container = self.app.containers.to_wrapper(first)
        first_sample = wrapped_container["A1"]

        # Assert
        assert first_sample.name.startswith('sample')
        assert first_sample._wrapped_version.latest is True
        assert len(connection.queries) == 0

    def test_with_no_subquery_for_latest_substance__two_substance_versions_are_fetched(self):
        # Arrange
        containers = ContainerVersion.objects.filter(
            latest=True, name__icontains='container').prefetch_related(
            Prefetch('archetype__substance_locations', to_attr='locations'),
            Prefetch('archetype__locations__substance'),
            Prefetch('archetype__locations__substance__versions', queryset=None),
            Prefetch('properties'))
        first = containers[0]
        reset_queries()

        # Act
        locations = first.archetype.locations
        substance = locations[0].substance
        versions = substance.versions.all()

        # Assert
        assert substance.name.startswith('sample')
        assert len(versions) == 2
        assert len(connection.queries) == 0

    def create_container_with_samples(
            self, container_class, substance_class, prefix="container", sample_count=10):
        container = self.create_container(container_class, prefix=prefix)
        for _ in range(sample_count):
            sample = self.create_substance(substance_class, color='red')
            container.append(sample)
        container.save()
        return container


class HairSampleContainer(PlateBase):
    rows = 8
    columns = 12

    comment = TextField("comment")
