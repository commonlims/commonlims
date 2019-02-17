This source code originated from https://github.com/getsentry/sentry. The idea was to both reuse a lot of features from Sentry's battle hardened code and in particular to use the design of their website as the core for ours, since as an open source solution in the life sciences, getting good designers for version 1.0 was not considered likely.

Initially, we'll allow a bunch of code to lay around the codebase that refers to sentry and some of it is never going to be used in Common LIMS. It's important to clean all of that up as we go along. This cleanup process is described here.

# v0.1.0

The SNP&SEQ team at Uppsala University/SciLifeLab will work on an initial alpha, which will be v0.1.0. This version is focused on implementing a limited set of functionality required in the SNP&SEQ lab.

During development of this version, it will make sense to be able to see the commit history for sentry's codebase so we are not removing anything while developing this.

If one encounters areas that need to be cleaned, commit them (and only them) to the shared cleanup branch, as they should be rebased during v0.1.1.

# v0.1.1

This is the cleanup version. It should do nothing but take that alpha and cleanup what we don't need from Sentry. Note that this version is a rebase of v0.1.0 (unusual, but acceptable in this case, since all the devs are within SNP&SEQ). This means that all work based on develop before this point should be committed before that (or merged "manually").

Start by rebasing the entirity of Sentry's own codebase up to the commit "Fork sentry" ce08159bc680cc54639dd3575172dcf6b2fcee0f. Merge in the cleanup branch accepting "theirs" for all files.

The end result is that we have have a new initial commit that has nothing but the part of Sentry's codebase that we've deemed necessary at this point. If more cleanup is needed later, that goes in as regular patches (i.e. no more rebasing on this branch ever).
