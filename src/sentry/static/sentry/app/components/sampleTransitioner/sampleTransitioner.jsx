import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ApiMixin from 'app/mixins/apiMixin';
import OrganizationState from 'app/mixins/organizationState';
import LoadingIndicator from 'app/components/loadingIndicator';
import SampleContainerStack from 'app/components/sampleTransitioner/sampleContainerStack';
import {SampleLocation} from 'app/components/sampleTransitioner/sampleLocation';
import {SampleTransition} from 'app/components/sampleTransitioner/sampleTransition';
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

class SampleTransitioner extends React.Component {
  constructor(props) {
    super(props);

    const {sampleBatch} = props;

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
      transitionTargetsOfHoveredSample: [],
    };
  }

  setCurrentSampleTransition(sampleTransition) {
    this.setState({currentSampleTransition: sampleTransition});
  }

  getCurrentSampleTransition() {
    return this.state.currentSampleTransition;
  }

  completeCurrentSampleTransition() {
    // TODO: should we de-dupe sample transitions here,
    // or leave that to the API?
    const { sampleTransitions } = this.state;
    const currentSampleTransition = this.getCurrentSampleTransition();

    if (currentSampleTransition.isComplete()) {
      // This is a hack! TODO: We should invoke an action to update the state.
      const updatedSampleTransitions = sampleTransitions.concat(currentSampleTransition);
      this.setState({sampleTransitions: updatedSampleTransitions});
      return true;
    } else {
      return false;
    }
  }

  onSourceWellClicked(sampleLocation, containsSampleId) {
    // If an empty well was clicked, clear current transition
    if (!containsSampleId) {
      return this.setCurrentSampleTransition(null);
    }

    // Otherwise reset the current sample transition
    if (sampleLocation.valid()) {
      this.setCurrentSampleTransition(
        new SampleTransition(sampleLocation, containsSampleId)
      );
    }
  }

  onTargetWellClicked(sampleLocation) {
    const currentSampleTransition = this.getCurrentSampleTransition();

    if (!currentSampleTransition || !currentSampleTransition.hasValidSource()) {
      return;
    }

    // If there is a valid source, create the target,
    // save the transition and clear current transition object.
    const targetSet = currentSampleTransition.setTarget(sampleLocation);
    if (targetSet) {
      const ok = this.completeCurrentSampleTransition();
      if (ok) {
        this.setCurrentSampleTransition(null);
      }
    }
  }

  onSourceWellMouseOver(sampleLocation, containsSampleId) {
    const { sampleTransitions } = this.state;

    // If an empty well was hovered, ignore
    if (!containsSampleId || !sampleLocation.valid()) {
      return;
    }

    // Then, Find all transitions for this well and highlight them.
    const filtered = sampleTransitions.filter(t => {
      const sl = t.sourceLocation;
      const {containerId, x, y} = sampleLocation;
      return sl.containerId == containerId && sl.x == x && sl.y == y;
    });

    const transitionTargetsOfHoveredSample = filtered.map(f => f.targetLocation);
    this.setState({transitionTargetsOfHoveredSample});
  }

  onMouseOut() {
    this.setState({transitionTargetsOfHoveredSample: []});
  }

  // For now we assume all samples fetched are mapped to source containers.
  // TODO: These could potentially be mapped to source OR target containers.
  // (Perhaps transitions have already been created and the result samples are in the target containers)
  render() {
    // TODO: only pass the transitions that are relevant to each container.
    const {
      transitionTargetsOfHoveredSample,
      currentSampleTransition,
      sampleTransitions
    } = this.state;

    // TODO: we should pass samples to the target container stack as well,
    // since we may be rendering this after fetching previously created transitions
    // from the api.
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
              onWellMouseOver={this.onSourceWellMouseOver.bind(this)}
              source={true}
              samples={this.props.sampleBatch.samples}
              onMouseOut={this.onMouseOut.bind(this)}
              currentSampleTransition={currentSampleTransition}
              transitionSources={sampleTransitions.map(st => st.sourceLocation)}
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
              onMouseOut={this.onMouseOut.bind(this)}
              currentSampleTransition={currentSampleTransition}
              transitionTargetsOfHoveredSample={transitionTargetsOfHoveredSample}
              transitionTargets={sampleTransitions.map(st => st.targetLocation)}
            />
          </div>
        </div>
        {JSON.stringify(sampleTransitions)}
      </div>
    );
  }
}

SampleTransitioner.propTypes = {
  // TODO: specify individual props instead of entire sampleBatch
  // sampleBatch: PropTypes.shape,
};

export default SampleTransitioner;
