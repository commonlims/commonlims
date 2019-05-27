import PropTypes from 'prop-types';
import React from 'react';
import InlineSvg from 'app/components/inlineSvg';

class SampleWell extends React.Component {
  getWellIcon() {
    const {
      hasContents,
      isTransitionSource,
      isTransitionTarget
    } = this.props;

    if (isTransitionSource) {
      return 'icon-well-transitioned';
    }

    if (isTransitionTarget) {
      return 'icon-well-added';
    }

    if (hasContents) {
      return 'icon-well-full';
    }

    return 'icon-well-empty';
  }

  getWellClassName() {
    const {
      isCurrentTransitionSource,
      inHoveredRowOrColumn,
      isTransitionTargetOfHoveredSample
    } = this.props;

    let className = 'sample-well';

    if (isCurrentTransitionSource) {
      className = `${className} selected`;
    } else if (isTransitionTargetOfHoveredSample) {
      className = `${className} highlighted`;
    }

    if (inHoveredRowOrColumn) {
      className = `${className} highlighted-background`;
    }

    return className;
  }

  handleMouseOver() {
    this.props.onSampleWellMouseOver(this);
  }

  handleClick() {
    this.props.onSampleWellClick(this);
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
          onClick={this.handleClick.bind(this)}
        />
      </td>
    );
  }
}

SampleWell.propTypes = {
  onSampleWellClick: PropTypes.func.isRequired,
  onSampleWellMouseOver: PropTypes.func.isRequired,
  isTransitionTargetOfHoveredSample: PropTypes.bool,
  isTransitionSource: PropTypes.bool,
  isTransitionTarget: PropTypes.bool,
  isCurrentTransitionSource: PropTypes.bool,
  inHoveredRowOrColumn: PropTypes.bool,
  row: PropTypes.number.isRequired,
  col: PropTypes.number.isRequired,
};

SampleWell.defaultProps = {
  isSelected: false,
  isTransitionTargetOfHoveredSample: false,
  inHoveredRowOrColumn: false,
  isTransitionSource: false,
  isTransitionTarget: false,
  isCurrentTransitionSource: false,
};

export default SampleWell;
