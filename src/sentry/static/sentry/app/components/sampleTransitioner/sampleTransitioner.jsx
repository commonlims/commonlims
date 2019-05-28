import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ApiMixin from 'app/mixins/apiMixin';
import OrganizationState from 'app/mixins/organizationState';
import LoadingIndicator from 'app/components/loadingIndicator';
import SampleContainerStack from 'app/components/sampleTransitioner/sampleContainerStack';
import { SampleLocation } from 'app/components/sampleTransitioner/sampleLocation';
import { SampleTransition } from 'app/components/sampleTransitioner/sampleTransition';
import { Sample } from 'app/components/sampleTransitioner/sample';
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
    const samples = sampleBatch.samples.map(s => new Sample(s.id, s.name, s.location));

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
      activeSampleTransition: null,
      transitionTargetLocationsOfHoveredSample: [],
      samples,
    };
  }

  setActiveSampleTransition(sampleTransition) {
    this.setState({activeSampleTransition: sampleTransition});
  }

  getActiveSampleTransition() {
    return this.state.activeSampleTransition;
  }

  completeActiveSampleTransition() {
    // TODO: should we de-dupe sample transitions here,
    // or leave that to the API?
    const { sampleTransitions } = this.state;
    const activeSampleTransition = this.getActiveSampleTransition();

    if (activeSampleTransition.isComplete()) {
      // This is a hack! TODO: We should invoke an action to update the state.
      const updatedSampleTransitions = sampleTransitions.concat(activeSampleTransition);
      this.setState({sampleTransitions: updatedSampleTransitions});
      return true;
    } else {
      return false;
    }
  }

  onSourceWellClicked(sampleLocation, containsSampleId) {
    // If an empty well was clicked, clear current transition
    if (!containsSampleId) {
      return this.setActiveSampleTransition(null);
    }

    // Otherwise reset the current sample transition
    if (sampleLocation.valid()) {
      this.setActiveSampleTransition(
        new SampleTransition(sampleLocation, containsSampleId)
      );
    }
  }

  onTargetWellClicked(sampleLocation) {
    const activeSampleTransition = this.getActiveSampleTransition();

    if (!activeSampleTransition || !activeSampleTransition.hasValidSource()) {
      return;
    }

    // If there is a valid source, create the target,
    // save the transition and clear current transition object.
    const targetSet = activeSampleTransition.setTarget(sampleLocation);
    if (targetSet) {
      const ok = this.completeActiveSampleTransition();
      if (ok) {
        this.setActiveSampleTransition(null);
      }
    }
  }

  onSourceWellMouseOver(sampleLocation, containsSampleId) {
    const { sampleTransitions } = this.state;

    // If an empty well was hovered, ignore
    if (!containsSampleId || !sampleLocation.valid()) {
      return;
    }

    // Find all transitions for this well and highlight them.
    const transitionTargetLocationsOfHoveredSample = sampleTransitions
      .filter(t => t.sourceLocation.equals(sampleLocation))
      .map(f => f.targetLocation);
    this.setState({transitionTargetLocationsOfHoveredSample});
  }

  onMouseOut() {
    this.setState({transitionTargetLocationsOfHoveredSample: []});
  }

  // For now we assume all samples fetched are mapped to source containers.
  // TODO: These could potentially be mapped to source OR target containers.
  // (Perhaps transitions have already been created and the result samples are in the target containers)
  render() {
    // TODO: only pass the transitions that are relevant to each container.
    const {
      transitionTargetLocationsOfHoveredSample,
      activeSampleTransition,
      sampleTransitions
    } = this.state;

    let activeSampleTransitionSourceLocation;
    if (activeSampleTransition) {
      activeSampleTransitionSourceLocation = activeSampleTransition.getSource();
    }

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
              samples={this.state.samples}
              onMouseOut={this.onMouseOut.bind(this)}
              activeSampleTransitionSourceLocation={activeSampleTransitionSourceLocation}
              transitionSourceLocations={sampleTransitions.map(st => st.sourceLocation)}
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
              transitionTargetLocationsOfHoveredSample={transitionTargetLocationsOfHoveredSample}
              transitionTargetLocations={sampleTransitions.map(st => st.targetLocation)}
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
