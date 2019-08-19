import PropTypes from 'prop-types';
import React from 'react';
import {Link} from 'react-router';
import classNames from 'classnames';

import CustomPropTypes from 'app/sentryTypes';
import Avatar from 'app/components/avatar';
import DateTime from 'app/components/dateTime';
import DeviceName from 'app/components/deviceName';

import 'app/../less/components/eventsTableRow.less';

class WorkflowTableRow extends React.Component {
  static propTypes = {
    hasUser: PropTypes.bool,
    orgId: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    workflow: CustomPropTypes.Workflow.isRequired,
  };

  static defaultProps = {};

  render() {
    const {className, workflow, orgId, projectId, groupId, tagList, hasUser} = this.props;
    const cx = classNames('events-table-row', className);
    const tagMap = {};

    return (
      <tr key={workflow.id} className={cx}>
        <td>
          <h5>
            <Link to={`/${orgId}/${projectId}/issues/${groupId}/events/${workflow.id}/`}>
              {workflow.title}
            </Link>
          </h5>
        </td>
      </tr>
    );
  }
}

export default WorkflowTableRow;
