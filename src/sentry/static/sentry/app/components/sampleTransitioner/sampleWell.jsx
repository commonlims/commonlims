import PropTypes from 'prop-types';
import React from 'react';
import InlineSvg from 'app/components/inlineSvg';
import { LocationState } from './location';

class SampleWell extends React.Component {
  getWellIcon() {
    switch (this.props.sampleWellState) {
      case LocationState.EMPTY:
        return 'icon-well-empty';
      case LocationState.NOT_EMPTY:
        return 'icon-well-full';
      case LocationState.NOT_EMPTY_TRANSITION_SOURCE:
        return 'icon-well-transitioned';
      case LocationState.NOT_EMPTY_TRANSITION_TARGET:
        return 'icon-well-added';
      default:
        return 'icon-well-empty';
    }
  }

  getWellClassName() {
    let className = 'sample-well';

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

  handleMouseOver() {
    this.props.onSampleWellMouseOver(this.props.row, this.props.col);
  }

  handleClick() {
    // TODO: set container id
    this.props.onSampleWellClick(999, this.props.row, this.props.col);
  }

  render() {
    return (
      <td
        className={this.getWellClassName()}
        onMouseOver={this.handleMouseOver.bind(this)}
      >
        <InlineSvg
          width="27px"
          height="27px"
          src={this.getWellIcon()}
          onClick={this.props.onSampleWellClick}
        />
      </td>
    );
  }
}

SampleWell.propTypes = {
  sampleWellState: PropTypes.number.isRequired,
  onSampleWellClick: PropTypes.func.isRequired,
  onSampleWellMouseOver: PropTypes.func.isRequired,
  isSelected: PropTypes.bool,
  isHighlighted: PropTypes.bool,
  isHighlightedBackground: PropTypes.bool,
  row: PropTypes.number.isRequired,
  col: PropTypes.number.isRequired,
};

SampleWell.defaultProps = {
  isSelected: false,
  isHighlighted: false,
  isHighlightedBackground: false,
};

export default SampleWell;
