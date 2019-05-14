import PropTypes from 'prop-types';
import React from 'react';
import {Panel, PanelBody} from 'app/components/panels';
import SampleContainerStackActions from './actions';
import {SampleContainer, SampleContainerType} from './sampleContainer';

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

  onSampleWellClicked(row, column) {
    this.props.onWellClicked(this.state.container.id, row, column);
  }

  render() {
    const containerType = this.props.isTemporary
      ? SampleContainerType.TARGET
      : SampleContainerType.SOURCE;

    return (
      <div style={{display: 'inline-block', minWidth: '540px'}}>
        <Panel>
          <SampleContainerStackActions
            canAdd={this.props.canAdd}
            canRemove={this.props.canRemove}
            container={this.state.container}
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
              samples={this.props.samples} // TODO/WIPconsole.log('ROWSAMPLES', rowSamples);: should only filter samples with this container id
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
  isTemporary: PropTypes.bool,
  canAdd: PropTypes.bool,
  canRemove: PropTypes.bool,
  containers: PropTypes.array,
  source: PropTypes.bool,
  // TODO: samples will be mapped directly to containers later
  samples: PropTypes.arrayOf(PropTypes.shape()),
};

SampleContainerStack.defaultProps = {
  samples: [],
};

SampleContainerStack.displayName = 'SampleContainerStack';

export default SampleContainerStack;
