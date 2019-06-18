from __future__ import absolute_import

from clims.legacy.domain import Container


class ContainerRepository:
    """
    Used to fetch `Container` domain objects. Fetches from a cache before
    creating from a rest resource.
    """

    def __init__(self):
        self.cache = dict()

    def get_container(self, container_resource, is_source):
        # TODO: It looks silly to have is_input here
        if container_resource.id in self.cache:
            return self.cache[container_resource.id]
        else:
            ret = Container.create_from_rest_resource(container_resource, is_source=is_source)
            self.cache[container_resource.id] = ret
            return ret
