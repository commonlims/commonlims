export class Sample {
  constructor(id, name, location) {
    this.id = id;
    this.name = name;
    this.location = location;
  }

  getLocation() {
    return this.location;
  }
}
