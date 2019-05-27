import PropTypes from 'prop-types';
import React from 'react';
import {Panel, PanelBody} from 'app/components/panels';
import SampleContainerStackActions from './actions';
import {SampleContainer, SampleContainerType} from './sampleContainer';
import { SampleLocation } from 'app/components/sampleTransitioner/sampleLocation';

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
    const containerType = this.props.source
      ? SampleContainerType.SOURCE
      : SampleContainerType.TARGET;

    const samples = this.props.samples.filter(
      s => s.location.containerId === this.state.container.id
    );

    const {
      transitionSources,
      transitionTargets,
      transitionTargetsOfHoveredSample,
      currentSampleTransition
    } = this.props;

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
              id={this.state.container.id}
              cols={this.state.container.dimensions.cols}
              rows={this.state.container.dimensions.rows}
              name={this.state.container.name}
              containerTypeName={this.state.container.typeName}
              containerType={containerType}
              onWellClicked={this.onSampleWellClicked.bind(this)}
              onWellMouseOver={this.onSampleWellMouseOver.bind(this)}
              onMouseOut={this.props.onMouseOut}
              samples={samples}
              transitionTargetsOfHoveredSample={transitionTargetsOfHoveredSample}
              currentSampleTransition={currentSampleTransition}
              transitionSources={transitionSources}
              transitionTargets={transitionTargets}
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
  // TODO: format these properly
  // or, samples will be mapped directly to containers later
  samples: PropTypes.arrayOf(PropTypes.shape()),
  // TODO: consider separate classes for source and target container stacks
  transitionTargetsOfHoveredSample: PropTypes.arrayOf(PropTypes.shape()),
  transitionTargets: PropTypes.arrayOf(PropTypes.shape()),
  transitionSources: PropTypes.arrayOf(PropTypes.shape()),
  currentSampleTransition: PropTypes.shape(),
};

SampleContainerStack.defaultProps = {
  samples: [],
  transitionTargetsOfHoveredSample: [],
  transitionTargets: [],
  transitionSources: [],
};

SampleContainerStack.displayName = 'SampleContainerStack';

export default SampleContainerStack;
