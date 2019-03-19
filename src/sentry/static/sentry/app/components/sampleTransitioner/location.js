export const LocationState = {
  EMPTY: 1,
  NOT_EMPTY: 2, // The well has a sample before entering the view
  NOT_EMPTY_TRANSITION_SOURCE: 3, // The well has a sample that has been transitioned (from src to target)
  NOT_EMPTY_TRANSITION_TARGET: 4, // A target well has a sample that has been transitioned
};

export class Location {
  // Location is an indexable location within a container, e.g. a well
  constructor(container, row, col) {
    this.container = container;
    this.row = row;
    this.col = col;
    this.id = this.container.id + '_' + this.row + '_' + this.col;
    this.content = null;

    // view specific data
    this.isSelected = false;
    this.highlightTransition = false;

    this.transitions = [];
  }

  getLocationState() {
    if (this.content === null) {
      return LocationState.EMPTY;
    } else {
      if (this.container.isTemporary) {
        return LocationState.NOT_EMPTY_TRANSITION_TARGET;
      } else {
        if (this.transitions.length > 0) {
          return LocationState.NOT_EMPTY_TRANSITION_SOURCE;
        } else {
          return LocationState.NOT_EMPTY;
        }
      }
    }
  }

  add(content, state) {
    this.content = content;
    this.state = state;
  }

  remove(content) {
    this.content = null;
    this.state = LocationState.EMPTY;
  }

  toContract() {
    return {
      containerId: this.container.id,
      row: this.row,
      col: this.col,
    };
  }
}
