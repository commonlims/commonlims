import PropTypes from 'prop-types';
import React from 'react';

class TaskGroupTitle extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      taskName: PropTypes.string,
      process: PropTypes.string,
      running: PropTypes.bool,
    }),
  };

  render() {
    let {data} = this.props;
    let {taskName, process, running} = data;

    let status = running ? '(running)' : '(waiting)';

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

export default TaskGroupTitle;
