import React from 'react';
import PropTypes from 'prop-types';
import SampleContainerStack from 'app/components/sampleTransitioner/sampleContainerStack';
import {SampleTransition} from 'app/components/sampleTransitioner/sampleTransition';
import {Flex, Box} from 'rebass';

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

// TODO: Rename to SubstanceTransitioner
class SampleTransitioner extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeTransition: null,
      transitionTargetLocationsOfHoveredSubstance: [],
    };
  }

  // constructor2() {
  //   this.state = {
  //     loading: false,
  //     error: false,
  //     sourceSampleContainers: sampleBatch.containers, // this should be a prop
  //     targetSampleContainers: [targetContainer],
  //     sampleTransitions: [],
  //     activeTransition: null,
  //     transitionTargetLocationsOfHoveredSample: [],
  //     samples,
  //   };
  // }

  setActiveSampleTransition(sampleTransition) {
    this.setState({activeTransition: sampleTransition});
  }

  getActiveTransition() {
    return this.state.activeTransition;
  }

  completeActiveSampleTransition() {
    // TODO: should we de-dupe sample transitions here,
    // or leave that to the API?
    const {sampleTransitions} = this.state;
    const activeTransition = this.getActiveTransition();

    if (activeTransition.isComplete()) {
      // This is a hack! TODO: We should invoke an action to update the state.
      const updatedSampleTransitions = sampleTransitions.concat(activeTransition);
      this.setState({sampleTransitions: updatedSampleTransitions});
      return true;
    } else {
      return false;
    }
  }

  onSourceWellClicked(sampleLocation, containsSampleId) {
    // If an empty well was clicked, clear current transition
    if (!containsSampleId) {
      this.setActiveSampleTransition(null);
    }

    // Otherwise reset the current sample transition
    if (sampleLocation.valid()) {
      this.setActiveSampleTransition(
        new SampleTransition(sampleLocation, containsSampleId)
      );
    }
  }

  onTargetWellClicked(sampleLocation) {
    const activeTransition = this.getActiveTransition();

    if (!activeTransition || !activeTransition.hasValidSource()) {
      return;
    }

    // If there is a valid source, create the target,
    // save the transition and clear current transition object.
    const targetSet = activeTransition.setTarget(sampleLocation);
    if (targetSet) {
      const ok = this.completeActiveSampleTransition();
      if (ok) {
        this.setActiveSampleTransition(null);
      }
    }
  }

  onSourceWellMouseOver(sampleLocation, containsSampleId) {
    const {sampleTransitions} = this.state;

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
    const {workBatch} = this.props;

    // Temporary hack: create a new target container
    // TODO: move to redux
    //
    // const targetContainer = {
    //   id: -1,
    //   name: 'HiSeqX-Thruplex_PL1_org_190322',
    //   dimensions: sourceContainers[0].dimensions,
    //   typeName: sourceContainers[0].typeName,
    // };

    // TODO: only pass the transitions that are relevant to each container.
    const {transitionTargetLocationsOfHoveredSample, activeTransition} = this.state;

    let activeTransitionSourceLocation;
    if (activeTransition) {
      activeTransitionSourceLocation = activeTransition.getSource();
    }

    // TODO: we should pass samples to the target container stack as well,
    // since we may be rendering this after fetching previously created transitions
    // from the api.
    return (
      <div>
        <Flex className="sample-transitioner">
          <Box p={1}>
            <SampleContainerStack
              title="Source containers"
              canAdd={false}
              canRemove={false}
              containers={workBatch.source.containers}
              onWellClicked={this.onSourceWellClicked.bind(this)}
              onWellMouseOver={this.onSourceWellMouseOver.bind(this)}
              source={true}
              substances={workBatch.source.substances}
              onMouseOut={this.onMouseOut.bind(this)}
              activeTransitionSourceLocation={activeTransitionSourceLocation}
              transitionSourceLocations={workBatch.transitions.map(
                st => st.sourceLocation
              )}
            />
          </Box>
          <Box p={1}>
            <SampleContainerStack
              title="Target containers"
              canAdd={true}
              canRemove={true}
              containers={workBatch.target.containers}
              onWellClicked={this.onTargetWellClicked.bind(this)}
              source={false}
              onMouseOut={this.onMouseOut.bind(this)}
              transitionTargetLocationsOfHoveredSample={
                transitionTargetLocationsOfHoveredSample
              }
              transitionTargetLocations={workBatch.transitions.map(
                st => st.targetLocation
              )}
            />
          </Box>
        </Flex>
        <Flex>{JSON.stringify(workBatch.transitions)}</Flex>
      </div>
    );
  }
}

SampleTransitioner.propTypes = {
  // TODO: specify the shape of the workBatch in another file
  workBatch: PropTypes.object,
};

export default SampleTransitioner;
