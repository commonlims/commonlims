# About

Common LIMS is as an independent open source initiative with SNP&SEQ Uppsala University (part of SciLifeLab) being the first implmementing lab. SNP&SEQ is also the main sponsor of the project in that it has dedicated parts of their development team's efforts to work on this project.

# Development

Development happens on gitlab.org/commonlims and will be moved to github.com/commonlims and made open to the public after the first milestone.

# Roadmap

## v0.1.0 - Core framework set up (DONE)

* The main building blocks and core roadmap are in place

 * Main design
 * UI
 * Workflow engine
 * Plugin mechanism
 * Several use cases in early draft (authentication, authorization, groups, settings, feature management and more)
 * A large part of the workflows in SNP&SEQ were implemented as POC

A large part of this was achieved so early by leveraging another open source system, https://sentry.io.

## v0.1.0 - A basic use case implemented for SNP&SEQ (CURRENT)

UI general:

* Users can see all queued tasks and limit to only what they will be working on
* Users can select samples to batch process and enter a per-batch workflow.
* Users can enter a specific per-batch subprocess required for SNP&SEQ, fragment_analyzer.

fragment_analyzer:

* Users can position samples as required. This means that a transition graph is created to/from different containers (e.g. sample cont1@a1 => cont2@a1)
* Implement the transition engine (see below for core design)
* Generic UI for FA specific variables
*

# Transition engine

The user can see a UI component (written in react) which allows them to drag samples from what we will call a SampleBatch, to different 1..n containers. This should then be committed to the backend so a relation between the SampleBatch and the TransitionGraph will exist for later steps of the process.
