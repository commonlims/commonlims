CLIMS uses the Camunda Workflow Engine under the hood, which in turn implements the [BPMN standard](https://camunda.com/bpmn/). The entire specification is [here](https://www.omg.org/spec/BPMN/2.0/).

Here we describe how core Camunda concepts have been adapted for use in CLIMS.

__Process__ The entire workflow a sample might go through, for example, "DNA Sequencing" or "Reception QC". It is a directed acyclic graph comprised of activities and sub-processes.

__Activity__ Also called a _step_, the smallest unit of work that a sample undergoes, for example, "Assess Sample Quality". An Activity can be automated or require human intervention.

__User Task__ An Activity that requires human intervention.

__Process Instance__ A specific instance of a Process, as applied to a sample. When a sample is assigned to a process, an instance is created for that process and the sub-processes/ activities ready for execution. The relationship between a sample and Process Instance is one-to-many.

__Activity Instance__ A specific instance of an Activity, that has a status (e.g. "Ready", "Done"). An Activity Instance is created when a sample arrives at that activity/step in the workflow.

__User Task Instance__ A specific instance of a User Task. An Activity Instance that requires human intervention.

__Work Batch__ A bundle of User Task Instances that is assigned to a user and has a status. This is a CLIMS-specific concept. When a batch of samples are assigned to a particular Process or Activity, one or more User Task Instances are created for each of the samples. These User Task Instances can then be bundled together into a Work Batch to be processed together, e.g. when a lab technician runs "Reception QC" on an entire plate of samples. If, for example, one or more samples fails to pass QC, these deviating samples may be assigned to a different Process/Activity for special handling, thereby creating new User Task Instances that are then bundled into a new Work Batch. Note that all items in a Work Batch are instances of the same User Task.
