# CommonLIMS Plugins

One of the cornerstones of Common LIMS' design is the plugin architecture. An install is composed of these tiers:

## Core

Everything is built upon the core. It defines domain objects and basic business rules. It does not define anything specific about a particular lab, and this is significant. The core team is dedicated to not allow any feature into the core that doesn't support most installs.

## UI

The primary UI (the react web application) is developed with the core. It defines various UI components that every install can benefit from, but no specifics.

## Plugins

The plugins specify how the system works in details, code, workflows and specific UI components.

Your institutions software specialists (bioinformaticians, software engineers or consultants) take care of setting these up.

Note that this does not mean that you have to write all your plugins yourself. The idea is that plugins are shared between labs (be it free and open source or commercial).

As a starting point, you might be interested in checking out https://github.com/molmed/commonlims-snpseq or find people with similar requirements at at https://gitter.im/commonlims.

# Custom types

The core defines various types which you can use directly, but you can also extend these types. One example of this is the Sample type. Let's say you need to maintain a specific measurement on each sample that most labs don't require, let's say `massiveness`. You can then subclass the core `Sample` object and use that in your plugin scripts instead.

Add a model in your models.py file, have it inherit from the core Sample type and define any properties on it you require:

```
import clims_base.models

class Sample(clims_base.models.Sample):
    massiveness = clims.models.IntProperty()
```

After running `lims upgrade` your property will be registered and ready to be used.

# A simple end-to-end example

Imagine you have a single workflow which we'll call `SimpleWorkflow`.

- Sample is imported by upploading a custom csv file having the format:

  [sample name],[volume],[concentration],[robot instructions]

This means you can find the sample in the search at http://localhost:8080/samples

- A project coordinator sees the sample under their task list at http://localhost:8080/tasks - adds it to `SimpleWorkflow`

- A research engineer sees that their worklist has updated at http://localhost:8080/tasks - starts work

- The research engineer enters a `UserTask` where they can see details on the sample

TODO: Finish this example
