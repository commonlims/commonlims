import PropTypes from 'prop-types';
import React from 'react';
import {Link} from 'react-router';
import classNames from 'classnames';
import CustomPropTypes from 'app/climsTypes';

class ProcessesTableRow extends React.Component {
  static propTypes = {
    truncate: PropTypes.bool,
    orgId: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    process: CustomPropTypes.Process.isRequired,
  };

  static defaultProps = {truncate: false};

  getProcessTitle = (process) => {
    if (process.processDefinitionInfo.name === null) {
      return process.processDefinitionInfo.key;
    } else {
      return process.processDefinitionInfo.name;
    }
  };

  getActivities = (process) => {
    if (process.activities.length == 0) {
      return '';
    } else if (process.activities.length == 1) {
      return process.activities[0].name;
    } else {
      return process.activities[0].name + ' + ' + process.activities.length - 1 + ' more';
    }
  };

  render() {
    const {className, process, orgId, projectId, truncate} = this.props;
    const cx = classNames('events-table-row', className);

    return (
      <tr key={process.id} className={cx}>
        <td>
          <h5 className={truncate ? 'truncate' : ''}>
            <Link to={`/${orgId}/${projectId}/processes/${process.id}/`}>
              {this.getProcessTitle(process)}
            </Link>
            <small>{process.id}</small>
          </h5>
        </td>
        <td>{this.getActivities(process)}</td>
      </tr>
    );
  }
}

export default ProcessesTableRow;
