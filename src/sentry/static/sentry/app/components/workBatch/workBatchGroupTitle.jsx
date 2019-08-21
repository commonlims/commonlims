import PropTypes from 'prop-types';
import React from 'react';

class WorkBatchGroupTitle extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      taskName: PropTypes.string,
      process: PropTypes.string,
      running: PropTypes.bool,
    }),
  };

  render() {
    const {data} = this.props;
    const {taskName, process, running} = data;

    const status = running ? '(running)' : '(waiting)';

    return (
      <span style={this.props.style}>
        <span style={{marginRight: 10}}>
          {taskName} {status}
        </span>
        <em title={process}>{process}</em>
        <br />
      </span>
    );
  }
}

export default WorkBatchGroupTitle;
