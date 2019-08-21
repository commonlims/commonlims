import PropTypes from 'prop-types';
import React from 'react';

class SampleTitle extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      title: PropTypes.string,
    }),
  };

  render() {
    const {data} = this.props;
    const {title} = data;

    return <span style={this.props.style}>{title}</span>;
  }
}

export default SampleTitle;
