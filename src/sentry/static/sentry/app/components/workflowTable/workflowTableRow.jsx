import PropTypes from 'prop-types';
import React from 'react';
import {Link} from 'react-router';
import classNames from 'classnames';

import CustomPropTypes from 'app/sentryTypes';

class WorkflowTableRow extends React.Component {
  static propTypes = {
    orgId: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    workflow: CustomPropTypes.Workflow.isRequired,
  };

  static defaultProps = {};

  render() {
    const {className, workflow, orgId, projectId} = this.props;
    const cx = classNames('events-table-row', className);

    return (
      <tr key={workflow.id} className={cx}>
        <td>
          <h5>
            <Link to={`/${orgId}/${projectId}/issues/1/events/${workflow.id}/`}>
              {workflow.title}
            </Link>
          </h5>
        </td>
      </tr>
    );
  }
}

export default WorkflowTableRow;
