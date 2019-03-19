import PropTypes from 'prop-types';
import React from 'react';
import InlineSvg from 'app/components/inlineSvg';
import {Container as ContainerPropType} from 'app/climsTypes';
import {LocationState} from './location';

const cellStyle = {
  padding: '5px',
  margin: '1px',
  color: '#BDB4C7',
};

const cellStyleSelected = {
  color: '#443950',
};

const cellStyleHighlightTransition = {
  color: 'rgb(166, 100, 239)',
};

const cellStyleHighlightBackground = {
  backgroundColor: 'aliceblue',
};

class SampleWell extends React.Component {
  getWellIcon() {
    switch (this.props.sampleWellState) {
      case LocationState.EMPTY:
        return 'icon-well-empty';
      case LocationState.NOT_EMPTY_TRANSITION_SOURCE:
        return 'icon-well-transitioned';
      case LocationState.NOT_EMPTY_TRANSITION_TARGET:
        return 'icon-well-added';
      default:
        return 'icon-well-full';
    }
  }

  getWellStyle() {
    let style = {};
    Object.assign(style, cellStyle);

    if (this.props.data.isSelected) {
      Object.assign(style, cellStyleSelected);
    } else if (this.props.data.highlightTransition) {
      Object.assign(style, cellStyleHighlightTransition);
    }

    if (
      this.props.data.container.viewLogic.focusRow === this.props.data.row ||
      this.props.data.container.viewLogic.focusCol === this.props.data.col
    ) {
      Object.assign(style, cellStyleHighlightBackground);
    }

    return style;
  }

  onClick(e) {
    e.preventDefault();
    let eventData = {
      location: this.props.data,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
    };
    this.props.onWellClicked(eventData);
  }

  onMouseOver(e) {
    let eventData = {
      location: this.props.data,
    };
    this.props.handleLocationHover(eventData);
  }

  render() {
    return (
      <td style={this.getWellStyle()}>
        <InlineSvg
          width="25px"
          height="25px"
          src={this.getWellIcon()}
          onClick={this.onClick.bind(this)}
          onMouseOver={this.onMouseOver.bind(this)}
        />
      </td>
    );
  }
}

SampleWell.propTypes = {
  handleLocationHover: PropTypes.func, // TODO: remove
  onWellClicked: PropTypes.func, // TODO: remove
  // TODO: Remove
  data: PropTypes.shape({
    col: PropTypes.number,
    row: PropTypes.number,
    container: ContainerPropType,
    getLocationState: PropTypes.func,
    highlightTransition: PropTypes.func,
    isSelected: PropTypes.bool,
  }),
  sampleWellState: PropTypes.number.isRequired,
  // TODO: implement these new prop types
  // onSampleWellClick: PropTypes.func, // TODO: make isRequired
  // onSampleWellHover: PropTypes.func, // TODO: make isRequired
};

export default SampleWell;
