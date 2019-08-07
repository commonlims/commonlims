CLIMS uses the Camunda Workflow Engine under the hood, which in turn uses [BPMN conventions](https://camunda.com/bpmn/).

Here we describe how core Camunda concepts have been adapted for use in CLIMS.

__Process__ The entire workflow a sample might go through, for example, "DNA Sequencing" or "Reception QC". It is a directed acyclic graph comprised of activities or sub-processes.

__Activity__ Also called a _step_, the smallest unit of work that a sample undergoes, for example, "Fragment Analyze".

__Process Instance__ A specific instance of a Process, as applied to a sample. When a sample is assigned to a process, an instance is created for that process and all its sub-processes and activities. The relationship between a sample and Process Instance is one-to-many.

__Activity Instance__ A specific instance of an Activity, that has a status (e.g. "Ready", "Done"). An Activity Instance can be automated or require human intervention.

__User Task__ An Activity Instance that requires human intervention.

__Work Batch__ A bundle of User Tasks that is assigned to a user and has a status. This is a CLIMS-specific concept. When a batch of samples are assigned to a specific Process, one or more User Tasks are created for each of the samples. Usually these User Tasks are processed and resolved together, e.g. when running "Reception QC" on an entire plate of samples. If, for example, one or more samples that do not pass QC, new UserTasks will be created for these deviating samples that are then bundled into a new Work Batch.
