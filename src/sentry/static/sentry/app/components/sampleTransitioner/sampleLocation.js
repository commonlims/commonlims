export class SampleLocation {
  constructor(containerId, x, y) {
    this.containerId = containerId;
    this.x = x;
    this.y = y;
  }

  // TODO: explore if we should validate this against the actual container
  valid() {
    return !!(this.containerId && Number.isInteger(this.x) && Number.isInteger(this.y));
  }

  equals(compareLocation) {
  	return this.containerId === compareLocation.containerId
  	  && this.x === compareLocation.x
  	  && this.y === compareLocation.y;
  }
}
