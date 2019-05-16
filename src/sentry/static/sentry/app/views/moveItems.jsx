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

class Container {
  constructor(id, name, dimensions, typeName) {
    // TODO: This object should only contain data, not viewData (like focus row), so it can be easily updated
    this.id = id;
    this.name = name;
    this.dimensions = dimensions;
    this.typeName = typeName;

    // TODO: get the view logic out and just keep it on a react component
    this.viewLogic = {
      focusRow: null,
      focusCol: null,
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

  transition(toRow, toCol, fromContainer, fromRow, fromCol) {
    // Create a transitition to this row/col from the other container
    this.validateIndex(toRow, toCol);
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

    // TODO: set transitions into state
    /*for (let transition of json.transitions) {
    }*/

    return ret;
  }
}

// TODO: Rename to TransitionSamples? Or something else?
class MoveItems extends React.Component {
  constructor(props) {
    super(props);

    const { sampleBatch } = props;

    // TODO: read transitions and target containers from userTask sampleBatch
    const sourceContainers = sampleBatch.containers;
    const samples = sampleBatch.samples;
    const formatted = ContainerSetData.createFromSampleBatchJson(sampleBatch);

    this.state = {
      loading: false,
      error: false,
      sourceSampleContainers: formatted.sourceContainers, // this should be a prop
      targetSampleContainers: formatted.targetContainers,
      sampleTransitions: [],
      currentSampleTransition: null,
    };
  }

  onSourceWellClicked(containerId, row, col, sampleId) {
    // If an empty well was clicked, clear current transition
    if (!sampleId) {
      this.setState({currentSampleTransition: null});
      return;
    }

    // TODO: setCurrentSampleTransition()
  }

  // Complete the current transition if appropriate
  onTargetWellClicked(containerId, row, col, sampleId) {
    console.log('TARGET WELL CLICKED', containerId, row, col, sampleId);
  }

  // For now we assume all samples fetched are mapped to source containers.
  // TODO: These could potentially be mapped to source OR target containers.
  // (Perhaps transitions have already been created and the result samples are in the target containers)
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
              onWellClicked={this.onSourceWellClicked.bind(this)}
              source={true}
              samples={this.props.sampleBatch.samples}
            />
          </div>
          <div className="col-md-6">
            <SampleContainerStack
              title="Target containers"
              canAdd={true}
              canRemove={true}
              containers={this.state.targetSampleContainers}
              onWellClicked={this.onTargetWellClicked.bind(this)}
              source={false}
            />
          </div>
        </div>
      </div>
    );
  }
}

MoveItems.propTypes = {
  // TODO: specify individual props instead of entire sampleBatch
  sampleBatch: PropTypes.shape,
};

export default MoveItems;
