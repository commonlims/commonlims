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
    let state = this.props.data.getLocationState();

    if (state == LocationState.EMPTY) {
      return 'icon-well-empty';
    } else if (state == LocationState.NOT_EMPTY_TRANSITION_SOURCE) {
      return 'icon-well-transitioned';
    } else if (state == LocationState.NOT_EMPTY_TRANSITION_TARGET) {
      return 'icon-well-added';
    } else {
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
  handleLocationHover: PropTypes.func,
  onWellClicked: PropTypes.func,
  // TODO: Remove out of data
  data: PropTypes.shape({
    col: PropTypes.number,
    row: PropTypes.number,
    container: ContainerPropType,
    getLocationState: PropTypes.func,
    highlightTransition: PropTypes.func,
    isSelected: PropTypes.bool,
  }),
};

export default SampleWell;
