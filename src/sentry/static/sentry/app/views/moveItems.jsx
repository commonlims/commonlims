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

// TODO: Rename to TransitionSamples? Or something else?
class MoveItems extends React.Component {
  constructor(props) {
    super(props);

    const { sampleBatch } = props;

    // TODO: read transitions and target containers from userTask sampleBatch
    const sourceContainers = sampleBatch.containers;
    const samples = sampleBatch.samples;

    // Temporary hack: create a new target container
    const targetContainer = {
      id: -1,
      name: 'HiSeqX-Thruplex_PL1_org_190322',
      dimensions: sourceContainers[0].dimensions,
      typeName: sourceContainers[0].typeName,
    };

    this.state = {
      loading: false,
      error: false,
      sourceSampleContainers: sampleBatch.containers, // this should be a prop
      targetSampleContainers: [targetContainer],
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
  // sampleBatch: PropTypes.shape,
};

export default MoveItems;
