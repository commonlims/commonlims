# Extensible types

Common LIMS provides a way to extend any entity by a plugin. This is currently implemented only for `Substance` types, but support will be added for `Project` and `Container` too.

Data in extensible types is split into both the model for the actual business entity (e.g. `Substance`) as well as the `Extensible*` models:

    * ExtensibleType
    * ExtensiblePropertyType
    * ExtensibleProperty
    * ExtensiblePropertyValue

Before being able to use their own type, a plugin first creates an `ExtensibleType` model:

```
properties = properties or [
    dict(name='color', raw_type=ExtensiblePropertyType.STRING, display_name='Col.'),
    dict(name='preciousness', raw_type=ExtensiblePropertyType.STRING, display_name='Prec.'),
    dict(name='payload', raw_type=ExtensiblePropertyType.JSON, display_name='Payload'),
]
substance_type = substances.register_type('GemstoneSample', 'substances', plugin, properties=properties)
```

This will create entries both in `ExtensibleType` and `ExtensiblePropertyType`:

```
psql -d clims -c "select * from clims_extensibletype" \
              -c "select * from clims_extensiblepropertytype";

 id |      name      | category | plugin_id
----+----------------+----------+-----------
  1 | GemstoneSample | default  |         1
(1 row)

 id |     name     | display_name | raw_type | extensible_type_id
----+--------------+--------------+----------+--------------------
  1 | color        | Col.         | s        |                  1
  2 | preciousness | Prec.        | s        |                  1
  3 | payload      | Payload      | j        |                  1
(3 rows)
```

Theses models are used to validate that the data is of the correct type. It will for example not be possible to add the property `weight` to the sample, as it hasn't been registered. It's also not possible to assign an integer to the color because it must be a string.

Let's now create a substance:

```
properties = {'color': 'red'}
substance = substances.create(name='sample1',
    extensible_type=substance_type,
    organization=org,
    properties=properties
)
```

As expected, this creates a `Substance` entry. It has the necessary relation to an organization and the type, as well as some other properties required by the framework:

```
psql -d clims -c "select * from clims_substance"

 id | name    | version | depth | extensible_type_id | organization_id | project_id
----+---------+---------+-------+--------------------+-----------------+------------
  1 | sample1 |       2 |     1 |                  1 |               1 |  
```

But what about the properties that are not required by the framework, but only the plugin? That information is in the `Extensible*` tables.

First of all, we have a `ExtensibleProperty` entry:

```
psql -d clims -c "select * from clims_extensibleproperty";

 id | version | latest | extensible_property_type_id | extensible_property_value_id
----+---------+--------+-----------------------------+------------------------------
  1 |       1 | t      |                           1 |                            1
```

Note that this, perhaps suprisingly, does not contain the value 'red'. That is instead kept in a `ExtensiblePropertyValue`:

```
psql -d clims -c "select * from clims_extensiblepropertyvalue";

 id | float_value | int_value | string_value | bool_value
----+-------------+-----------+--------------+------------
  1 |             |           | red          |
```

The reason for this is that we'll want to be able to copy objects with a low overhead. Imagine that we have a sample that has a large document associated with it. With this structure we can create a thousand aliquots from it without copying the value a thousand times.

## Versions

The design of the system assumes that you'll never delete a property. Instead, all properties are copied and both versions are kept. Let's look at how that works under the hood:

```
substances.update('sample', extensible_type=sample_type, organization=org,
                  properties=dict(color='blue'))
```

This leads to the following entries in the database:

```
psql -d clims -c "select * from clims_extensibleproperty" \
              -c "select * from clims_extensiblepropertyvalue";

 id | version | latest | extensible_property_type_id | extensible_property_value_id
----+---------+--------+-----------------------------+------------------------------
  1 |       1 | f      |                           1 |                            1
  2 |       2 | t      |                           1 |                            2
(2 rows)

 id | float_value | int_value | string_value | bool_value
----+-------------+-----------+--------------+------------
  1 |             |           | red          |
  2 |             |           | blue         |
(2 rows)
```

Notice how we got a new version in the property table where only the latest version is marked as latest.

This design allows developers to easily write tools that show exactly what happened to a property. It's also simple to revert back to previous versions if required.
