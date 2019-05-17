export const LocationState = {
  EMPTY: 1,
  NOT_EMPTY: 2, // The well has a sample before entering the view
  NOT_EMPTY_TRANSITION_SOURCE: 3, // The well has a sample that has been transitioned (from src to target)
  NOT_EMPTY_TRANSITION_TARGET: 4, // A target well has a sample that has been transitioned
};

export class SampleLocation {
  constructor(containerId, x, y) {
    this.containerId = containerId;
    this.x = x;
    this.y = y;
  }

  // TODO: explore if we should validate this against the actual container
  valid() {
    return this.containerId && this.x && this.y;
  }
}