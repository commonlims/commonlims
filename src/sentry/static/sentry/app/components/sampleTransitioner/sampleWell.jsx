import PropTypes from 'prop-types';
import React from 'react';
import InlineSvg from 'app/components/inlineSvg';
import {LocationState} from './location';

const cellStyle = {
  padding: '5px',
  margin: '1px',
  color: '#BDB4C7',
};

const cellStyleSelected = {
  color: '#443950',
};

const cellStyleHighlighted = {
  color: 'rgb(166, 100, 239)',
};

const cellStyleHighlightedBackground = {
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

    if (this.props.isSelected) {
      Object.assign(style, cellStyleSelected);
    } else if (this.props.isHighlighted) {
      Object.assign(style, cellStyleHighlighted);
    }

    if (this.props.isHighlightedBackground) {
      Object.assign(style, cellStyleHighlightedBackground);
    }

    return style;
  }

  render() {
    return (
      <td style={this.getWellStyle()}>
        <InlineSvg
          width="25px"
          height="25px"
          src={this.getWellIcon()}
          onClick={this.props.onSampleWellClick}
          onMouseOver={this.props.onSampleWellHover}
        />
      </td>
    );
  }
}

SampleWell.propTypes = {
  sampleWellState: PropTypes.number,
  isSelected: PropTypes.bool,
  isHighlighted: PropTypes.bool,
  isHighlightedBackground: PropTypes.bool,
  onSampleWellClick: PropTypes.func.isRequired,
  onSampleWellHover: PropTypes.func.isRequired,
};

SampleWell.defaultProps = {
  sampleWellState: LocationState.EMPTY,
  isSelected: false,
  isHighlighted: false,
  isHighlightedBackground: false,
};

export default SampleWell;
