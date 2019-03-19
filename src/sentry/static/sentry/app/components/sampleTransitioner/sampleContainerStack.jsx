import PropTypes from 'prop-types';
import React from 'react';
import {Panel, PanelBody} from 'app/components/panels';
import SampleContainerStackActions from './actions';
import SampleContainer from './sampleContainer';

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

  render() {
    return (
      <div style={{display: 'inline-block', minWidth: '600px'}}>
        <h4>{this.props.title}</h4>
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

SampleContainerStack.propTypes = {
  title: PropTypes.string,
  handleLeaveContainer: PropTypes.func,
  handleLocationHover: PropTypes.func,
  onWellClicked: PropTypes.func,
  isTemporary: PropTypes.bool,
  canAdd: PropTypes.bool,
  canRemove: PropTypes.bool,
  containers: PropTypes.array,
  source: PropTypes.bool,
};

SampleContainerStack.displayName = 'SampleContainerStack';

export default SampleContainerStack;
