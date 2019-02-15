import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ApiMixin from 'app/mixins/apiMixin';
import OrganizationState from 'app/mixins/organizationState';
import LoadingIndicator from 'app/components/loadingIndicator';
import {Panel, PanelBody} from 'app/components/panels';
import ContainerStackActions from 'app/views/containerStack/actions';
import InlineSvg from 'app/components/inlineSvg';

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

// TODO: Move to type file and rename (getting lint errors)
const ContainerPropType = PropTypes.shape({
  get: PropTypes.func,
  viewLogic: PropTypes.shape({
    focusRow: PropTypes.number,
    focusCol: PropTypes.number,
  }),
  dimensions: PropTypes.shape({
    cols: PropTypes.number,
    rows: PropTypes.number,
  }),
});

const Hidden = {
  display: 'none',
};

const LocationState = {
  EMPTY: 1,
  NOT_EMPTY: 2, // The well has a sample before entering the view
  NOT_EMPTY_TRANSITION_SOURCE: 3, // The well has a sample that has been transitioned (from src to target)
  NOT_EMPTY_TRANSITION_TARGET: 4, // A target well has a sample that has been transitioned
};

const containerStyle = {
  margin: '4px',
  borderCollapse: 'collapse',
};

const cellStyleHeader = {
  padding: '1px',
  margin: '1px',
  color: '#BDB4C7',
  textAlign: 'center',
};

const cellStyle = {
  padding: '5px',
  margin: '1px',
  color: '#BDB4C7',
};

const cellStyleSelected = {
  color: '#443950',
};

const cellStyleHighlightTransition = {
  color: 'rgb(166, 100, 239)',
};

const cellStyleHighlightBackground = {
  backgroundColor: 'aliceblue',
};

class Well extends React.Component {
  getWellIcon() {
    let state = this.props.data.getLocationState();

    if (state == LocationState.EMPTY) {
      return 'icon-well-empty';
    } else if (state == LocationState.NOT_EMPTY_TRANSITION_SOURCE) {
      return 'icon-well-transitioned';
    } else if (state == LocationState.NOT_EMPTY_TRANSITION_TARGET) {
      return 'icon-well-added';
    } else {
      return 'icon-well-full';
    }
  }

  getWellStyle() {
    let style = {};
    Object.assign(style, cellStyle);

    if (this.props.data.isSelected) {
      Object.assign(style, cellStyleSelected);
    } else if (this.props.data.highlightTransition) {
      Object.assign(style, cellStyleHighlightTransition);
    }

    if (
      this.props.data.container.viewLogic.focusRow === this.props.data.row ||
      this.props.data.container.viewLogic.focusCol === this.props.data.col
    ) {
      Object.assign(style, cellStyleHighlightBackground);
    }

    return style;
  }

  onClick(e) {
    e.preventDefault();
    let eventData = {
      location: this.props.data,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
    };
    this.props.onWellClicked(eventData);
  }

  onMouseOver(e) {
    let eventData = {
      location: this.props.data,
    };
    this.props.handleLocationHover(eventData);
  }

  render() {
    return (
      <td style={this.getWellStyle()}>
        <InlineSvg
          width="25px"
          height="25px"
          src={this.getWellIcon()}
          onClick={this.onClick.bind(this)}
          onMouseOver={this.onMouseOver.bind(this)}
        />
      </td>
    );
  }
}

Well.propTypes = {
  handleLocationHover: PropTypes.func,
  onWellClicked: PropTypes.func,
  // TODO: Remove out of data
  data: PropTypes.shape({
    col: PropTypes.number,
    row: PropTypes.number,
    container: ContainerPropType,
    getLocationState: PropTypes.func,
    highlightTransition: PropTypes.func,
    isSelected: PropTypes.bool,
  }),
};

class ContainerComponent extends React.Component {
  //displayName: 'ContainerComponent';

  // Receives a prop container, that can e.g. come from the sample-batch endpoint

  getRowIndicator(rowIndex) {
    return String.fromCharCode(65 + rowIndex);
  }

  getColIndicator(colIndex) {
    return colIndex + 1;
  }

  getHeaderStyle(row, col) {
    let style = {};
    Object.assign(style, cellStyleHeader);
    if (
      this.props.container.viewLogic.focusRow === row ||
      this.props.container.viewLogic.focusCol === col
    ) {
      Object.assign(style, cellStyleHighlightBackground);
    }
    return style;
  }

  createRows() {
    let rows = [];
    let colsHeader = [];

    colsHeader.push(<td style={cellStyleHeader} />);
    for (let c = 0; c < this.props.container.dimensions.cols; c++) {
      colsHeader.push(
        <td style={this.getHeaderStyle(-1, c)}>{this.getColIndicator(c)}</td>
      );
    }
    rows.push(<tr>{colsHeader}</tr>);

    for (let r = 0; r < this.props.container.dimensions.rows; r++) {
      let cols = [];

      cols.push(<td style={this.getHeaderStyle(r, -1)}>{this.getRowIndicator(r)}</td>);
      for (let c = 0; c < this.props.container.dimensions.cols; c++) {
        cols.push(
          <Well
            data={this.props.container.get(r, c)}
            onWellClicked={this.props.onWellClicked}
            handleLocationHover={this.props.handleLocationHover}
          />
        );
      }
      rows.push(<tr>{cols}</tr>);
    }
    return rows;
  }

  onMouseLeave(e) {
    this.props.handleLeaveContainer(this.props.container);
  }

  render() {
    return (
      <table style={containerStyle} onMouseLeave={this.onMouseLeave.bind(this)}>
        <tbody> {this.createRows()} </tbody>
      </table>
    );
  }
}

ContainerComponent.propTypes = {
  handleLeaveContainer: PropTypes.func,
  handleLocationHover: PropTypes.func,
  onWellClicked: PropTypes.func,
  container: ContainerPropType,
};

ContainerComponent.displayName = 'ContainerComponent';

class ContainerCollection extends React.Component {
  // A ContainerCollection allows the user to move between 1..n different containers

  render() {
    return (
      <div>
        <h4>{this.props.title}</h4>
        <Panel>
          <ContainerStackActions
            canAdd={this.props.canAdd}
            canRemove={this.props.canRemove}
            container={this.props.containers[0]}
          />
          <PanelBody>
            <ContainerComponent
              container={this.props.containers[0]}
              isTemporary={this.props.isTemporary}
              onWellClicked={this.props.onWellClicked}
              handleLocationHover={this.props.handleLocationHover}
              handleLeaveContainer={this.props.handleLeaveContainer}
            />
          </PanelBody>
        </Panel>
      </div>
    );
  }
}

ContainerCollection.propTypes = {
  title: PropTypes.string,
  handleLeaveContainer: PropTypes.func,
  handleLocationHover: PropTypes.func,
  onWellClicked: PropTypes.func,
  isTemporary: PropTypes.bool,
  canAdd: PropTypes.bool,
  canRemove: PropTypes.bool,
  containers: PropTypes.array,
};

ContainerCollection.displayName = 'ContainerCollection';

class Location {
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

// TODO: Rename to TransitionSamples? Or something else?
class PositionSamples extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: false,
    };

    this.currentHover = null;
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

  handleLocationHover(data) {
    if (data.location !== this.currentHover) {
      this.handleLocationHoverChanged(data.location, this.currentHover);
      this.currentHover = data.location;
    }
  }

  handleLocationHoverChanged(currentLocation, previousLocation) {
    //let from = previousLocation ? previousLocation.id : "(null)";
    //let to = currentLocation ? currentLocation.id : "(null)";

    currentLocation.container.viewLogic.focusCol = currentLocation.col;
    currentLocation.container.viewLogic.focusRow = currentLocation.row;

    // If we have an item that's in a transition, we want to highlight all other parts of that transition
    let previousTransition = previousLocation
      ? this.props.containerSet.transitions.getByLocation(previousLocation)
      : null;
    let currentTransition = currentLocation
      ? this.props.containerSet.transitions.getByLocation(currentLocation)
      : null;

    // Start by undoing the last one:
    if (previousTransition) {
      for (let item of previousTransition) {
        item.source.highlightTransition = false;
        item.target.highlightTransition = false;
      }
    }

    if (currentTransition) {
      for (let item of currentTransition) {
        item.source.highlightTransition = true;
        item.target.highlightTransition = true;
      }
    }

    this.setState({containerSet: this.state.containerSet});
  }

  onWellClicked(data) {
    let {ctrlKey, shiftKey} = data;
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
    this.setState({containerSet: this.state.containerSet});
  }

  render() {
    // Actions defined by plugins
    const pluginActionsDef = [
      {
        title: 'Print labels',
        correlation: {
          plugin: 'snpseq',
          handler: 'features.fragment_analyze.controller.FragmentAnalyzeController',
          method: 'handle_print_labels',
          hash: 'hash-with-signature-TODO',
        },
      },
      {
        title: 'Do something silly!',
        correlation: {
          plugin: 'snpseq',
          handler: 'features.fragment_analyze.controller.FragmentAnalyzeController',
          method: 'handle_print_labels',
          hash: 'hash-with-signature-TODO',
        },
      },
    ];
    const pluginActions = pluginActionsDef.map(def => {
      let handler = () => this.props.handlePluginAction(def.correlation);
      return (
        <a className="btn btn-sm btn-default" onClick={handler} key={def.correlation}>
          {def.title}
        </a>
      );
    });

    return (
      <div>
        <div className="row">
          <div className="col-md-6">
            <ContainerCollection
              title="Source containers"
              canAdd={false}
              canRemove={false}
              containers={this.props.containerSet.sourceContainers}
              isTemporary={false}
              onWellClicked={this.onWellClicked.bind(this)}
              handleLocationHover={this.handleLocationHover.bind(this)}
              handleLeaveContainer={this.handleLeaveContainer.bind(this)}
            />
          </div>
          <div className="col-md-6">
            <ContainerCollection
              title="Target containers"
              canAdd={true}
              canRemove={true}
              containers={this.props.containerSet.targetContainers}
              isTemporary={true}
              onWellClicked={this.onWellClicked.bind(this)}
              handleLocationHover={this.handleLocationHover.bind(this)}
              handleLeaveContainer={this.handleLeaveContainer.bind(this)}
            />
          </div>

          {/* User defined actions for this view only */}
        </div>
        <div className="row">
          <div className="col-md-12">{pluginActions}</div>
        </div>
      </div>
    );
  }
}

PositionSamples.propTypes = {
  containerSet: PropTypes.shape({
    sourceContainers: PropTypes.array.isRequired,
    targetContainers: PropTypes.array.isRequired,
    transitions: PropTypes.shape({
      getByLocation: PropTypes.func,
      removeTransition: PropTypes.func,
      createTransition: PropTypes.func,
    }),
  }),
  handlePluginAction: PropTypes.func,
};

class ContainerSet {
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
    let ret = new ContainerSet();
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
        'target-1',
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

const FragmentAnalyzeView = createReactClass({
  // TODO: Move the state all the way here, so it's not lost when we move between components?
  displayName: 'FragmentAnalyzeView',

  contextTypes: {
    release: PropTypes.object,
  },

  mixins: [ApiMixin, OrganizationState],

  getInitialState() {
    return {
      loading: true,
      error: false,
      showTab: 0,
    };
  },

  componentDidMount() {
    this.fetchData();
  },

  componentDidUpdate(prevProps) {
    if (this.props.location.search !== prevProps.location.search) {
      this.fetchData();
    }
  },

  getSampleBatchEndpoint() {
    return `/sample-batches/${this.props.params.batchId}/`;
  },

  handlePluginAction(correlation) {
    // 1. post an action to the plugin endpoint
    // 2. get a response, for now it's synch (in the backend) but TODO: it's should be queued by the backend
    //    as plugins will be written that take too much time executing
    console.trace();
    this.api.request('/plugins/snpseq/snpseq/actions/', {
      method: 'POST',
      data: correlation,
      success: (data, _, jqXHR) => {
        // TODO: We need load state here, possibly on the button?
        //
      },
      error: () => {
        this.setState({
          error: true,
        });
      },
    });
  },

  fetchData() {
    this.setState({
      loading: true,
      error: false,
    });

    this.api.request(this.getSampleBatchEndpoint(), {
      method: 'GET',
      data: this.props.location.query,
      success: (data, _, jqXHR) => {
        this.setState({
          error: false,
          loading: false,
          containerSet: ContainerSet.createFromSampleBatchJson(data),
        });
      },
      error: () => {
        this.setState({
          error: true,
          loading: false,
        });
      },
    });
  },

  switchToTransition(tab) {
    this.setState({showTab: 0});
  },

  switchToDetails(tab) {
    this.setState({showTab: 1});
  },

  save() {
    // Let's imagine this puts to the sample-batch endpoint and get's an updated contract back:
    // TODO: Look into not nesting state objects,
    // see https://stackoverflow.com/questions/43040721/how-to-update-nested-state-properties-in-react
    // TODO: Disable temporarily while saving
    let sampleBatch = this.state.containerSet.toSampleBatch();

    this.api.request('/sample-batches/', {
      method: 'PUT',
      data: sampleBatch,
      success: (data, _, jqXHR) => {
        this.setState({
          error: false,
          loading: false,
          containerSet: ContainerSet.createFromSampleBatchJson(data),
        });
      },
      error: () => {
        this.setState({
          error: true,
          loading: false,
        });
      },
    });
  },

  render() {
    if (this.state.loading) return <LoadingIndicator />;
    return (
      <div>
        {/* <div class="row"> */}
        {/* </div> */}
        <div className="row">
          <div className="col-md-8">
            <ul className="nav nav-tabs">
              <li>
                <a onClick={this.switchToTransition}>Transition samples</a>
              </li>
              <li>
                <a onClick={this.switchToDetails}>Details</a>
              </li>
            </ul>
          </div>
          <div className="col-md-4">
            <div className="align-right">
              <a className="btn btn-sm btn-default" onClick={this.save}>
                Save
              </a>
            </div>
          </div>
        </div>

        <div className="row" style={this.state.showTab == 0 ? {} : Hidden}>
          <PositionSamples
            handlePluginAction={this.handlePluginAction}
            containerSet={this.state.containerSet}
          />
        </div>
        {/* <div style={this.state.showTab == 1 ? {} : Hidden}> */}
        {/*   <BatchDetails /> */}
        {/* </div> */}
      </div>
    );
  },
});

export default FragmentAnalyzeView;
