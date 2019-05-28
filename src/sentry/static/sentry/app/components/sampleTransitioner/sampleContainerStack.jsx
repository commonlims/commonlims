import PropTypes from 'prop-types';
import React from 'react';
import {Panel, PanelBody} from 'app/components/panels';
import SampleContainerStackActions from './actions';
import {SampleContainer, SampleContainerDirectionality} from './sampleContainer';
import { SampleLocation } from 'app/components/sampleTransitioner/sampleLocation';
import { Sample } from 'app/components/sampleTransitioner/sample';

class SampleContainerStack extends React.Component {
  // A SampleContainerStack allows the user to move between 1..n different containers
  constructor(props) {
    super(props);

    this.state = {
      containerIndex: 0,
      container: this.props.containers[0],
    };
  }

  nextContainer(e) {
    e.preventDefault();
    let containerIndex = this.state.containerIndex + 1;
    if (containerIndex > this.props.containers.length - 1) {
      containerIndex = 0;
    }
    const container = this.props.containers[containerIndex];

    this.setState({containerIndex, container});
  }

  previousContainer(e) {
    e.preventDefault();
    let containerIndex = this.state.containerIndex - 1;
    if (containerIndex < 0) {
      containerIndex = this.props.containers.length - 1;
    }
    const container = this.props.containers[containerIndex];

    this.setState({containerIndex, container});
  }

  onSampleWellClicked(location, sampleId) {
    this.props.onWellClicked(location, sampleId);
  }

  onSampleWellMouseOver(location, sampleId) {
    if(!this.props.onWellMouseOver) {
      return;
    }

    this.props.onWellMouseOver(location, sampleId);
  }

  render() {
    const containerDirectionality = this.props.source
      ? SampleContainerDirectionality.SOURCE
      : SampleContainerDirectionality.TARGET;

    const samples = this.props.samples.filter(
      s => s.location.containerId === this.state.container.id
    );

    const {
      transitionSourceLocations,
      transitionTargetLocations,
      transitionTargetsOfHoveredSample,
      activeSampleTransition
    } = this.props;

    let activeSampleTransitionSource;
    if (activeSampleTransition) {
      activeSampleTransitionSource = activeSampleTransition.getSource();
    }

    return (
      <div style={{display: 'inline-block', minWidth: '540px'}}>
        <Panel>
          <SampleContainerStackActions
            canAdd={this.props.canAdd}
            canRemove={this.props.canRemove}
            name={this.state.container.name}
            numContainers={this.props.containers.length}
            containerIndex={this.state.containerIndex + 1}
            source={this.props.source}
            nextContainer={this.nextContainer.bind(this)}
            previousContainer={this.previousContainer.bind(this)}
          />
          <PanelBody>
            <SampleContainer
              containerId={this.state.container.id}
              containerDirectionality={containerDirectionality}
              numColumns={this.state.container.dimensions.cols}
              numRows={this.state.container.dimensions.rows}
              onWellClicked={this.onSampleWellClicked.bind(this)}
              onWellMouseOver={this.onSampleWellMouseOver.bind(this)}
              onMouseOut={this.props.onMouseOut}
              samples={samples}
              transitionTargetsOfHoveredSample={transitionTargetsOfHoveredSample}
              activeSampleTransitionSource={activeSampleTransitionSource}
              transitionSourceLocations={transitionSourceLocations}
              transitionTargetLocations={transitionTargetLocations}
            />
          </PanelBody>
        </Panel>
      </div>
    );
  }
}

SampleContainerStack.propTypes = {
  title: PropTypes.string,
  onWellClicked: PropTypes.func,
  onWellMouseOver: PropTypes.func,
  onMouseOut: PropTypes.func.isRequired,
  canAdd: PropTypes.bool,
  canRemove: PropTypes.bool,
  containers: PropTypes.array,
  source: PropTypes.bool,
  samples: PropTypes.arrayOf(PropTypes.instanceOf(Sample)),
  // TODO: format these properly
  // TODO: consider separate classes for source and target container stacks
  transitionTargetsOfHoveredSample: PropTypes.arrayOf(PropTypes.shape()),
  transitionTargetLocations: PropTypes.arrayOf(PropTypes.shape()),
  transitionSourceLocations: PropTypes.arrayOf(PropTypes.shape()),
  activeSampleTransition: PropTypes.shape(),
};

SampleContainerStack.defaultProps = {
  samples: [],
  transitionTargetsOfHoveredSample: [],
  transitionTargetLocations: [],
  transitionSourceLocations: [],
};

SampleContainerStack.displayName = 'SampleContainerStack';

export default SampleContainerStack;
