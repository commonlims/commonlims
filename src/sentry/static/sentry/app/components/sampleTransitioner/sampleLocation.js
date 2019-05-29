export class SampleLocation {
  constructor(containerId, row, column) {
    this.containerId = containerId;
    this.column = column;
    this.row = row;
  }

  // TODO: explore if we should validate this against the actual container
  valid() {
    return !!(this.containerId && Number.isInteger(this.column) && Number.isInteger(this.row));
  }

  equals(compareLocation) {
  	return this.containerId === compareLocation.containerId
  	  && this.column === compareLocation.column
  	  && this.row === compareLocation.row;
  }
}
