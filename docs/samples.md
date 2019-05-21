The core of any LIMS is managing samples and ensuring integrity of their data and ancestry. Great care has been taken to ensure that these principles are met in Common LIMS.

# Auditing

The general rule in Common LIMS is never to delete any data. Individual labs can of course decide to archive old samples if required, but (given that you backup your data) you should always be able to track the status of a sample in any state it has ever been in. The history of samples is maintained by doing a full copy of them in the database before editing them. This is common practice in many information systems that require strict audit logs. An alternative would be to maintain diffs of entered data or use an append-only database. We don't take that route here because it's in a sense more complex and much more difficult to handle GDPR requirements.

- Note that this decision comes at the cost of increased database size, but full audit logs that are simple to query were more deemed more important by us.

# Ancestry

In Common LIMS, every sample is either an original sample or an ancestor of such a sample. Samples can keep their name when properties change, but then they'll always get a new version number (see the chapter on Auditing).

It's easiest to understand the sample lifetime by looking at an example.

## The sample enters the lab

```
# Example code:
a = Sample("A")
```

![Sample enters the lab](./img/samples-01-imported.png)

Here you have a single sample, named "A". It has version 1, since it has no parent.

## You change any property of the sample

```
a = samples.find("A")  # Since you don't specify a version, you'll get the latest
a.volume = 100.0
```

![Volume set to 100.0](./img/samples-02.png)

We now have two samples, both named A, but with different version numbers.

## You try to change an old version

This would fail, since you can never modify an old version of a sample:

```
a = samples.find("A", version=1)
a.volume = 100.0  # Throws a CannotModifyArchivedItemException
```

## You create an aliquot

You would now like to create an aliquot, taking 10% of the samples volume and adding it to another well.

The api supports two ways to do this. The straightforward:

```
b = a.copy("B")
b.volume = 10.0
a.volume -= 10.0
```

or this one liner, designed to make sure the developer doesn't forget to subtract from the parent:

```
b = a.transfer("B", volume=10.0)
```

This will also copy the sample and then make the change.

In any case, the ancestry now looks like this:

![Create an aliquot](./img/samples-03.png)

## Names change when you create an aliquot

The previous API calls (copy and transfer) require you to update the name of the sample before saving it. This avoids confusion about where a sample is coming from.

So if we would allow this:

```
copy = a.copy("A")
copy.volume = 10.0
a.volume -= 10.0
```

It would be difficult to know what version to apply to each:

![Version inconsistency](./img/samples-04.png)

So a new sample entity is created for the aliquot. Contrast this to when a property is changed, the sample identity remains the same.
