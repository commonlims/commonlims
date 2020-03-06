

from django.db import models
from sentry.db.models import (FlexibleForeignKey, sane_repr)
from clims.models.extensible import ExtensibleModel, ExtensibleVersion


class Project(ExtensibleModel):
    """
    A project is a model that describes a project, and it's properties. Typically a number
    of substances will be associated with a project.

    NOTE: Use the project service class (`from clims.services import projects`) to create or
    update projects and properties as otherwise business rules will be broken, e.g. you might
    update a project but not its properties.
    """
    __core__ = True

    def __init__(self, *args, **kwargs):
        super(Project, self).__init__(*args, **kwargs)

    name = models.TextField()
    organization = FlexibleForeignKey('sentry.Organization', related_name='projects')

    # TODO What other properties do we want to be native to the projects?
    #      I think that there are more things that could be added to the project
    #      model than the substance model, since it is a more generic concept.

    __repr__ = sane_repr('name',)

    class Meta:
        app_label = 'clims'
        db_table = 'clims_project'
        unique_together = ('name', 'organization')


class ProjectVersion(ExtensibleVersion):
    __core__ = True

    archetype = models.ForeignKey("clims.Project", related_name='versions')

    __repr__ = sane_repr('project_id', 'version', 'latest')
