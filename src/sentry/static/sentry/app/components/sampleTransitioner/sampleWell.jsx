import PropTypes from 'prop-types';
import React from 'react';
import InlineSvg from 'app/components/inlineSvg';
import { LocationState } from './location';

class SampleWell extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // TODO: explore if we should rather store
      // the sample ids of the contents
      hasContents: false,
      isTransitionSource: false,
      isTransitionTarget: false,
    };

    this.setAsTransitionSource.bind(this);
    this.setAsTransitionTarget.bind(this);
    this.removeAsTransitionSource.bind(this);
    this.removeAsTransitionTarget.bind(this);
  }

  // TODO: investigate using reflux-connect to
  // use the redux mapstatetoprops pattern
  // in order to handle this automatically.
  componentWillReceiveProps(props) {
    const { hasContents } = props;
    this.setState({ hasContents });
  }

  getWellIcon() {
    const { hasContents, isTransitionSource, isTransitionTarget } = this.state;
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
    this.props.onSampleWellClick(this);
  }

  setAsTransitionSource() {
    this.setState({ isTransitionSource: true });
  }

  setAsTransitionTarget() {
    this.setState({ isTransitionTarget: true });
  }

  removeAsTransitionSource() {
    this.setState({ isTransitionSource: false });
  }

  removeAsTransitionTarget() {
    this.setState({ isTransitionTarget: false });
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
  // TODO: many of these should be handled internally only.
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
