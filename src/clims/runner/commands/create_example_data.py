
from __future__ import absolute_import, print_function

import click
import six
from sentry.runner.decorators import configuration
from django.db.utils import IntegrityError
from click import echo


@click.command()
@configuration
def createexampledata():
    """
    Create example data for clims
    """
    # Import models here because they need to be wrapped with a Django context to work.
    # /JD 2019-05-27
    from clims.models.work_batch import WorkBatch
    WorkBatch.objects.create(name="Test1", organization_id=1, handler="somehandler")
    WorkBatch.objects.create(name="Test2", organization_id=1, handler="somehandler2")
    WorkBatch.objects.create(name="Test3", organization_id=1, handler="somehandler2")

    from clims.models import WorkBatch, PluginRegistration, ExtensibleType, ExtensibleInstance, PropertyType, PropertyInstance
    from sentry.models import Project
    WorkBatch.objects.get_or_create(name="Test", organization_id=1, handler="somehandler")

    # Example:
    # Stuck on an planet far away from anything, we're trying to survive.
    # We have been training these giant beasts called Muffalos. Our scientists
    # have the difficult task to research these animals with our home-made equipment.
    #
    # They are now researching grains of hair from these animals. Each hair sample is
    # put in our homemade tubes. We keep 4 tubes glued together in a 2x2
    # matrix which we call a plate.
    #
    # NOTE: During the design phase, this example is much more detailed than it will be later. In fact,
    # we'll probably move all of this to the example plugin.

    click.echo("Creating RimWorld research project")

    click.echo("- Creating the plugin registration")
    plugin_registration, created = PluginRegistration.objects.get_or_create(
        name='clims_plugin_rimworld', version="1.0.0")

    click.echo("- Creating the project")
    muffalos, created = Project.objects.get_or_create(
        name="Research muffalo hair", organization_id=1)

    # Create an extensible_type for HairSample. This we'll represent with a class in Python (later). For now
    # we're just registering the low level object:
    click.echo("- Creating the HairSample type")
    hair_sample_type, created = ExtensibleType.objects.get_or_create(
        name="HairSample", plugin_registration=plugin_registration)

    # The HairSample has these properties:
    #   - thickness
    #   - length
    thickness, _ = PropertyType.objects.get_or_create(
        name="thickness",
        raw_type=PropertyType.FLOAT,
        extensible_type=hair_sample_type)
    length, _ = PropertyType.objects.get_or_create(
        name="length",
        raw_type=PropertyType.FLOAT,
        extensible_type=hair_sample_type)

    click.echo("- Register some samples")
    import random
    random.seed(0)

    for postfix in six.moves.range(10):
        # When adding samples on a low level, we add a Substance element
        # Note that this is simpler using high level classes.
        sample_name = "muffalo_sample_{}".format(postfix + 1)

        from django.db import transaction

        with transaction.atomic():
            instance, created = ExtensibleInstance.objects.get_or_create(
                name=sample_name, type=hair_sample_type)
            val = 0.1 + (random.random() * 0.01)
            try:
                # TODO: Is this increasing the pk counter even when empty? Look into a fix
                # if that's the case
                PropertyInstance.objects.get_or_create(
                    property_type=thickness, float_value=val, instance=instance)
                PropertyInstance.objects.get_or_create(
                    property_type=length, float_value=val, instance=instance)
            except IntegrityError:
                pass

    echo(
        "Number of registered samples: {}".format(
            ExtensibleInstance.objects.filter(
                type=hair_sample_type).count()))

    # Note that by using the prefetch_related method, we ensure that there are no subsequent queries to fetch
    # the properties. So (given that the ORM creates a sensible SQL query out of this) this is now asymptotically
    # equivalent to fetching the instance had it be saved in a single table
    first = ExtensibleInstance.objects.all().prefetch_related('properties__property_type')[0]

    echo("Fetching the first:")
    echo("- " + first.name)
    for prop in first.properties.filter(latest=True):  # This query is now in-memory only
        echo(repr(prop))

    # Let's find the volume property and set the value to something else. This will always lead to
    # new version if you set the value through the `value` property.
    # NOTE: API code should never set the value directly as it will not lead to the correct logic
    # of increasing the and enforcing the type. This must currently be enforced through code reviews.
    # NOTE: Bulk saving will not call the save method, which in turn increases the version number. So if
    # bulk saving property changes, one must increase the version specifically.

    # This throws an error if there are more than one
    thickness = first.properties.get(latest=True, property_type__name='thickness')
    thickness.value += 100.0
    thickness.save()

    # This is saving these on a low level, but that's too complicated, so let's create a new sample type but define it in
    # a class instead (see below)

    # USER TASKS
    # We are now going to extend the user task model which is registered by the core:

    # TODO: Register in migration scripts
    plugin_registration, _created = PluginRegistration.objects.get_or_create(
        name='clims_plugin_core', version="1.0.0")
    work_batch_type, _created = ExtensibleType.objects.get_or_create(
        name="WorkBatch", plugin_registration=plugin_registration)

    # Define all available props on this user task:
    counter, _ = PropertyType.objects.get_or_create(
        name="counter",
        raw_type=PropertyType.FLOAT,
        extensible_type=work_batch_type)

    obj, _created = ExtensibleInstance.objects.get_or_create(
        name='some user task', type=work_batch_type)
    try:
        PropertyInstance.objects.get_or_create(
            property_type=counter, float_value=100.0, instance=obj)
    except IntegrityError:
        pass


class HairSample():
    pass
