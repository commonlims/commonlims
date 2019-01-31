import PropTypes from 'prop-types';
import React from 'react';

class SampleTitle extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      taskName: PropTypes.string,
      process: PropTypes.string,
    }),
  };

  render() {
    let {data} = this.props;
    let {taskName, process} = data;

    return (
      <span style={this.props.style}>
        <span style={{marginRight: 10}}>{taskName}</span>
        <em title={process}>{process}</em>
        <br />
      </span>
    );
  }
}

export default SampleTitle;
