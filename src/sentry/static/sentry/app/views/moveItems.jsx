import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ApiMixin from 'app/mixins/apiMixin';
import OrganizationState from 'app/mixins/organizationState';
import LoadingIndicator from 'app/components/loadingIndicator';
import SampleContainerStack from 'app/components/sampleTransitioner/sampleContainerStack';
import {Location, LocationState} from 'app/components/sampleTransitioner/location';
import UserTaskStore from 'app/stores/userTaskStore';

// TODO: Handle more than one by laying them down_first or right_first
// TODO: Implement shift and ctrl select
//
// TODO: Allow n..n rather than just 1..n. That would enable pooling
// TODO: losing focus on the table should cancel all highlights
// TODO: Be able to switch the container view to a list of samples that can be transitioned
// TODO: Add and remove target containers
// TODO: Allow moving within the same plate
// TODO: Auto-save user's changes in each tab
// TODO: A bunch of mapping code here that could be simplified by synching apis
//
// TODO in transition:
//   [x] Rename container after placing samples

const Hidden = {
  display: 'none',
};

class Container {
  constructor(id, name, dimensions, typeName, isTemporary) {
    // TODO: This object should only contain data, not viewData (like focus row), so it can be easily updated
    this.id = id;
    this.name = name;
    this.dimensions = dimensions;
    this.typeName = typeName;
    this.isTemporary = isTemporary;
    this.locations = {};

    // TODO: get the view logic out and just keep it on a react component
    this.viewLogic = {
      focusRow: null,
      focusCol: null,
    };

    // This might be optimized if required, but if we have just a few containers
    // it doesn't matter.
    for (let r = 0; r < this.dimensions.rows; r++) {
      for (let c = 0; c < this.dimensions.cols; c++) {
        let key = r + '_' + c;
        this.locations[key] = new Location(this, r, c);
      }
    }
  }

  toContract() {
    // maps back to a simple json object that can be used with the api
    return {
      id: this.id,
      name: this.name,
      isTemporary: this.isTemporary,
      dimensions: this.dimensions,
      typeName: this.typeName,
    };
  }

  getKey(row, col) {
    return row + '_' + col;
  }

  validateIndex(row, col) {
    if (row < 0 || row >= this.dimensions.rows)
      throw new Error('Row must be between 0 and ' + this.dimensions.rows);
    if (col < 0 || col >= this.dimensions.cols)
      throw new Error('Column must be between 0 and ' + this.dimensions.cols);
  }

  *getLocations(predicate) {
    for (let key of Object.keys(this.locations)) {
      let loc = this.locations[key];
      if (predicate(loc)) yield loc;
    }
  }

  insert(row, col, sample) {
    this.validateIndex(row, col);
    // Add a sample to this container
    this.locations[this.getKey(row, col)].add(sample, LocationState.NOT_EMPTY);
  }

  remove(row, col) {
    this.validateIndex(row, col);
    this.locations[this.getKey(row, col)].remove();
  }

  transition(toRow, toCol, fromContainer, fromRow, fromCol) {
    // Create a transitition to this row/col from the other container
    this.validateIndex(toRow, toCol);
  }

  get(row, col) {
    // Returns the Location object at the row or column.
    // NOTE: Does not return the sample direcdtly, even though set adds a sample. That might be confusing.
    this.validateIndex(row, col);
    return this.locations[this.getKey(row, col)];
  }
}

class Sample {
  constructor(id, name, project) {
    this.id = id;
    this.name = name;
    this.project = project;
  }
}

class Transition {
  constructor(source, target, type = 'general') {
    this.source = source;
    this.target = target;
    this.type = type;
  }

  toContract() {
    return {
      sourceLocation: {
        row: this.source.row,
        col: this.source.col,
        containerId: this.source.container.id,
        type: this.type,
      },
      targetLocation: {
        row: this.target.row,
        col: this.target.col,
        containerId: this.target.container.id,
        type: this.type,
      },
    };
  }
}

class Transitions {
  // Handles mappings between source and targets and provides a simple way
  // to query for those mappings
  constructor() {
    this._transitions = [];
    this._mappedBySource = {};
    this._mappedByTarget = {};
  }

  createTransition(source, target) {
    let transition = new Transition(source, target);
    this._transitions.push(transition);

    if (this._mappedBySource[source.id] == undefined) {
      this._mappedBySource[source.id] = [];
    }
    if (this._mappedByTarget[target.id] == undefined) {
      this._mappedByTarget[target.id] = [];
    }

    this._mappedBySource[source.id].push(transition);
    this._mappedByTarget[target.id].push(transition);

    // TODO: Redesign? Thinking about keeping samples/analytes in the source containers and only transitions in the
    // target object. But that Transition object should probably be a TransitionCollection object or something, because
    // we are going to support n..n
    target.content = transition; // TODO: Consider using the transitions instead

    source.transitions.push(transition);
    target.transitions.push(transition);
  }

  removeTransition(transition) {
    this._transitions = this._transitions.filter(item => item != transition);
    transition.source.highlightTransition = false;
    transition.target.highlightTransition = false;

    this._mappedBySource[transition.source.id] = this._mappedBySource[
      transition.source.id
    ].filter(item => item != transition);
    this._mappedByTarget[transition.target.id] = this._mappedByTarget[
      transition.target.id
    ].filter(item => item != transition);

    // TODO: n..n
    transition.target.content = null;

    transition.source.transitions = transition.source.transitions.filter(
      item => item != transition
    );
    transition.target.transitions = transition.target.transitions.filter(
      item => item != transition
    );
  }

  getByTarget(target) {
    return this._mappedByTarget[target.id];
  }
  getBySource(source) {
    return this._mappedBySource[source.id];
  }

  getByLocation(location) {
    let ret = this.getBySource(location);
    if (!ret) ret = this.getByTarget(location);
    return ret;
  }
}

class ContainerSetData {
  // An in memory structure for the sample batch. Uses the json from the sample-batch endpoint
  // to construct a heavier object with a simpler api
  // This object must not contain any view state info, so it can easily be updated from the endpoint
  //
  constructor() {
    this.sourceContainers = [];
    this.targetContainers = [];
    this.transitions = new Transitions();
  }

  static createFromSampleBatchJson(json) {
    let ret = new ContainerSetData();
    let containers = {};

    // TODO: These properties should be mapped without specifying each (copying), so
    // we can extend the object
    ret.batchId = json.batchId;
    ret.correlation = json.correlation;

    for (let contract of json.containers) {
      let container = new Container(
        contract.id,
        contract.name,
        contract.dimensions,
        contract.typeName,
        false
      );

      containers[container.id] = container;
      ret.sourceContainers.push(container);
    }

    for (let contract of json.tempContainers) {
      let container = new Container(
        contract.id,
        contract.name,
        contract.dimensions,
        contract.typeName,
        true
      );

      containers[container.id] = container;
      ret.targetContainers.push(container);
    }

    for (let sample of json.samples) {
      let sampleObj = new Sample(sample.id, sample.name, 'project'); // TODO: Project
      containers[sample.location.containerId].insert(
        sample.location.row,
        sample.location.col,
        sampleObj
      );
    }

    // TODO: Insert transitions in target containers

    if (ret.targetContainers.length == 0) {
      let firstTarget = new Container(
        ret.batchId + '-1',
        'HiSeqX-Thruplex_PL1_org_190322',
        ret.sourceContainers[0].dimensions,
        ret.sourceContainers[0].typeName,
        true
      );
      ret.targetContainers.push(firstTarget);
    }

    for (let transition of json.transitions) {
      let sloc = transition.sourceLocation;
      let tloc = transition.targetLocation;

      let source = ret.findLocation(sloc.row, sloc.col, sloc.containerId);
      let target = ret.findLocation(tloc.row, tloc.col, tloc.containerId);
      ret.transitions.createTransition(source, target);
    }

    return ret;
  }

  findContainer(id) {
    for (let container of this.sourceContainers) {
      if (container.id === id) return container;
    }

    for (let container of this.targetContainers) {
      if (container.id === id) return container;
    }
    return null;
  }

  findLocation(row, col, containerId) {
    let container = this.findContainer(containerId);
    return container.get(row, col);
  }

  toSampleBatch() {
    let ret = {};
    ret.batchId = this.batchId;
    ret.correlation = this.correlation;
    ret.containers = [];
    ret.tempContainers = [];
    ret.transitions = [];
    ret.samples = [];

    for (let container of this.sourceContainers) {
      ret.containers.push(container.toContract());

      for (let location of container.getLocations(x => x.content !== null)) {
        let sample = location.content;

        let sampleJson = {
          name: sample.name,
          id: sample.id,
          location: location.toContract(),
        };
        ret.samples.push(sampleJson);
      }
    }

    for (let container of this.targetContainers) {
      ret.tempContainers.push(container.toContract());
    }

    for (let transition of this.transitions._transitions) {
      let transitionJson = transition.toContract();
      ret.transitions.push(transitionJson);
    }

    return ret;
  }
}

// TODO: Rename to TransitionSamples? Or something else?
class MoveItems extends React.Component {
  constructor(props) {
    super(props);

    const sampleBatch = ContainerSetData.createFromSampleBatchJson(
      this.props.userTask.sampleBatch
    );

    this.state = {
      loading: false,
      error: false,
      sourceSampleContainers: sampleBatch.sourceContainers, // this should be a prop
      targetSampleContainers: sampleBatch.targetContainers,
      sampleTransitions: [],
      samples: this.props.userTask.sampleBatch.samples,
      currentTransition: null,
    };
  }

  // Propagate this function to all sample wells.
  // When a sample well is clicked, it can invoke this with its own location.
  updateCurrentTransition() {
    //this.currentTransition
  }

  wellsEqual(well1, well2) {
    return well1.row == well2.row && well1.col == well2.col;
  }

  *getSourceLocations(predicate) {
    // Get all locations in any source container
    for (let container of this.props.containerSet.sourceContainers) {
      for (let loc of container.getLocations(predicate)) {
        yield loc;
      }
    }
  }

  createTransition(source, target) {
    source.isSelected = false;
    this.props.containerSet.transitions.createTransition(source, target);
    this.onTransitionCreated();
  }

  onTransitionCreated() {}

  onTransitionRemoved() {}

  removeTransitionForTarget(target) {
    for (let transition of target.transitions) {
      this.props.containerSet.transitions.removeTransition(transition);
      this.onTransitionRemoved();
    }
    target.isSelected = false;
  }

  handleLeaveContainer(container) {
    container.viewLogic.focusCol = null;
    container.viewLogic.focusRow = null;
  }

  handleTargetWellClicked(loc, ctrlKey, shiftKey) {
    let selLocations = [];

    for (let currentLoc of this.getSourceLocations(loc2 => {
      return loc2.isSelected;
    })) {
      selLocations.push(currentLoc);
    }

    if (loc.getLocationState() == LocationState.NOT_EMPTY_TRANSITION_TARGET) {
      this.removeTransitionForTarget(loc);
      return;
    }

    if (selLocations.length == 1) {
      this.createTransition(selLocations[0], loc);
    }
  }

  onWellClicked(containerId, row, col) {
    /*let {ctrlKey, shiftKey} = data;
    let loc = data.location;

    if (loc.container.isTemporary) {
      this.handleTargetWellClicked(loc, ctrlKey, shiftKey);
      // TODO: How do we propagate this now?
      this.setState({containerSet: this.state.containerSet});
      return;
    }

    for (let key of Object.keys(loc.container.locations)) {
      let otherLoc = loc.container.locations[key];
      if (otherLoc == loc) continue;
      if (otherLoc.isSelected) {
        otherLoc.isSelected = false;
      }
    }

    if (loc.getLocationState() == LocationState.EMPTY) {
      return;
    }

    loc.isSelected = !loc.isSelected;
    this.setState({containerSet: this.state.containerSet});*/
    console.log('WELLCLICKED', containerId, row, col);
  }

  render() {
    return (
      <div className="sample-transitioner">
        <div className="row">
          <div className="col-md-6">
            <SampleContainerStack
              title="Source containers"
              canAdd={false}
              canRemove={false}
              containers={this.state.sourceSampleContainers}
              isTemporary={false}
              onWellClicked={this.onWellClicked.bind(this)}
              source={true}
            />
          </div>
          <div className="col-md-6">
            <SampleContainerStack
              title="Target containers"
              canAdd={true}
              canRemove={true}
              containers={this.state.targetSampleContainers}
              isTemporary={true}
              onWellClicked={this.onWellClicked.bind(this)}
              source={false}
            />
          </div>
        </div>
      </div>
    );
  }
}

MoveItems.propTypes = {
  containerSet: PropTypes.shape({
    sourceContainers: PropTypes.array.isRequired,
    targetContainers: PropTypes.array.isRequired,
    transitions: PropTypes.shape({
      getByLocation: PropTypes.func,
      removeTransition: PropTypes.func,
      createTransition: PropTypes.func,
    }),
  }),
};

export default MoveItems;
