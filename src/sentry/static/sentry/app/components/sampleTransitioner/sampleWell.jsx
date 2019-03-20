import PropTypes from 'prop-types';
import React from 'react';
import InlineSvg from 'app/components/inlineSvg';
import {LocationState} from './location';

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

  getWellClassName() {
    let className = 'sample-well ';

    if (this.props.isSelected) {
      className = `${className} selected`;
    } else if (this.props.isHighlighted) {
      className = `${className} highlighted`;
    }

    if (this.props.isHighlightedBackground) {
      className = `${className} highlighted-background`;
    }

    return className;
  }

  render() {
    return (
      <td className={this.getWellClassName()}>
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
