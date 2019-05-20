export class SampleLocation {
  constructor(containerId, x, y) {
    this.containerId = containerId;
    this.x = x;
    this.y = y;
  }

  // TODO: explore if we should validate this against the actual container
  valid() {
    return !!(this.containerId && this.x && this.y);
  }
}
