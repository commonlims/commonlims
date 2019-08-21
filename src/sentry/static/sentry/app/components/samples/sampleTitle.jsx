import PropTypes from 'prop-types';
import React from 'react';

class SampleTitle extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      name: PropTypes.string,
    }),
  };

  render() {
    const {data} = this.props;
    const {name} = data;
    const subtitle = null;

    if (subtitle) {
      return (
        <span style={this.props.style}>
          <span style={{marginRight: 10}}>{name}</span>
          <em title={subtitle}>{subtitle}abc</em>
          <br />
        </span>
      );
    }
    return <span style={this.props.style}>{name}</span>;
  }
}

export default SampleTitle;
