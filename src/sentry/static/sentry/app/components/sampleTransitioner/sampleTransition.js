export class SampleTransition {
  // Supports a targetSampleId in cases where transitions are read
  // from the API, which may have already created a new sample in the
  // target location.
  constructor(
    sourceLocation,
    sourceSampleId,
    targetLocation = null,
    targetSampleId = null
  ) {
    if (sourceLocation.valid()) {
      this.sourceLocation = sourceLocation;
      this.sourceSampleId = sourceSampleId;
    }

    this.setTarget(targetLocation, targetSampleId);
  }

  getSource() {
    return this.sourceLocation;
  }

  getTarget() {
    return this.sourceTarget;
  }

  hasValidSource() {
    return this.sourceLocation.valid() && this.sourceSampleId;
  }

  hasValidTarget() {
    return this.targetLocation.valid();
  }

  setTarget(targetLocation, targetSampleId = null) {
    // Target should only be set if the source is valid.
    const ok =
      this.sourceLocation &&
      this.hasValidSource() &&
      targetLocation &&
      targetLocation.valid();

    if (ok) {
      this.targetLocation = targetLocation;
      this.targetSampleId = targetSampleId;
      return true;
    } else {
      return false;
    }
  }

  isComplete() {
    return this.hasValidSource() && this.hasValidTarget();
  }
}
