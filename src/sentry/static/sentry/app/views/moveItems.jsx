import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ApiMixin from 'app/mixins/apiMixin';
import OrganizationState from 'app/mixins/organizationState';
import LoadingIndicator from 'app/components/loadingIndicator';
import SampleContainerStack from 'app/components/sampleTransitioner/sampleContainerStack';
import { SampleLocation } from 'app/components/sampleTransitioner/sampleLocation';
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

// TODO: move to another file?
class SampleTransition {
  // Supports a targetSampleId in cases where transitions are read
  // from the API, which may have already created a new sample in the
  // target location.
  constructor(sourceLocation, sourceSampleId, targetLocation = null, targetSampleId = null) {
    if (sourceLocation.valid()) {
      this.sourceLocation = sourceLocation;
      this.sourceSampleId = sourceSampleId;
    }

    this.setTarget(targetLocation, targetSampleId);
  }

  hasValidSource() {
    return this.sourceLocation.valid() && this.sourceSampleId;
  }

  hasValidTarget() {
    return this.targetLocation.valid();
  }

  setTarget(targetLocation, targetSampleId=null) {
    // Target should only be set if the source is valid.
    const ok = this.sourceLocation &&
      this.hasValidSource() &&
      targetLocation &&
      targetLocation.valid();

    if (ok) {
      this.targetLocation = targetLocation;
      this.targetSampleId = targetSampleId;
      return true;
    } else {
      return false;
    }
  }

  isComplete() {
    return this.hasValidSource() && this.hasValidTarget();
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
      // TODO: is this the best way of doing things?
      currentSampleTransitionSourceWell: null,
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
      this.setState({ sampleTransitions: updatedSampleTransitions });
      return true;
    } else {
      return false;
    }
  }

  onSourceWellClicked(well, sampleLocation, containsSampleId) {
    const { currentSampleTransitionSourceWell } = this.state;

    // If an empty well was clicked, clear current transition
    if (!containsSampleId) {
      return this.setCurrentSampleTransition(null);
    }

    // Otherwise reset the current sample transition
    if (sampleLocation.valid()) {
      if (currentSampleTransitionSourceWell) {
        currentSampleTransitionSourceWell.removeAsTransitionSource();
      }

      this.setCurrentSampleTransition(new SampleTransition(sampleLocation, containsSampleId));
      well.setAsTransitionSource();
      this.setState({ currentSampleTransitionSourceWell: well });
    }
  }


  onTargetWellClicked(well, sampleLocation) {
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
        well.setAsTransitionTarget();
        this.setCurrentSampleTransition(null);
      }
    }

    // TODO: call setAsTransitionTarget(); // See onSourceWellClicked
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
