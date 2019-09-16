# Substances on a high level

The main domain object in a LIMS is probably the Sample object or objects derived from samples (aliquots). In Common LIMS, samples are subclasses of a more generic type called Substance. A `Substance` models both Samples and Aliquots, but also other material that may be combined with them in some lab-specific set.

Let's imagine that you have a gemstone lab. In this lab, a sample might be a small bit of a larger gemstone.

You would have to tell the LIMS that you're working with gemstones, so you would implement the GemstoneSample type in your plugin:

```
# TODO: This part of the API is still being worked on. One can currently only
# interact with the proxied objects mentioned below

class GemstoneSample(Sample):
    color = TextField()
    comment = TextField()
```

The GemstoneSample object is in fact a proxy for a range of database models:

    * Substance
    * ExtensibleType
    * ExtensiblePropertyType
    * ExtensibleProperty
    * ExtensiblePropertyValue

More information on how these work is found in the document [extensible.md](./extensible.md).

When the system registers your plugin, it finds your `GemstoneSample`. Based on it, the system creates an entry in the table `ExtensibleType`, which registers your `GemstoneSample` class. It also creates two entries in the `ExtensiblePropertyType` table, for each of the properties.

Now you can create an instance of the `Substance` like this:

```
s1 = GemstoneSample()
s1.color = "red"
s1.comment = "some comment"
s1.save()
```

Under the hood, this will type check against the `ExtensibleType` and the `ExtensiblePropertyType`s and then save a new `Substance` entry with two new `ExtensibleProperty` entries.

This is achieved by means of the `SubstanceService` class. When you call `s1.save()` above, it will call the service object which in turn will save all of the required objects.

# Working with substances on a low level

NOTE: This section is intended for those that need more control over the creation extensible objects.

When creating a Substance, you'll first need a `ExtensibleType` entry. You can create that with a call to the substances service.

```
properties = properties or [
    dict(name='color', raw_type=ExtensiblePropertyType.STRING, display_name='Colour'),
    dict(name='comment', raw_type=ExtensiblePropertyType.STRING, display_name='Comment'),
]

substance_type = substances.register_type('GemstoneSample', 'substances', plugin, properties=properties)
```

We will now have one `ExtensibleType` entry in the DB as well as two `ExtensiblePropertyType` entries.

The next step is to create the `Substance` instance. One can do this via the `substances` singleton like this:

```
props = {
    'comment': 'found this yesterday',
    'color': 'red'
}

substance = substances.create(
    name=name,
    extensible_type=substance_type,
    organization=org,
    properties=properties
)
```

This will create one `Substance` where:

    * It is marked as version 1
    * It has the properties `comment` and `color` set
    * It has been type checked against the substance type we created before
    * It has no origins or parents as it's not derived from any sample

We could now make a copy of the substance:

```
aliquot = substances.copy()
```

This creates an object that has the same properties as the sample, but where:

    * It has one parent, the sample, which are also its origins
