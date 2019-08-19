import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

import {t} from 'app/locale';
import CustomPropTypes from 'app/sentryTypes';
import WorkflowTableRow from 'app/components/workflowTable/workflowTableRow';

class WorkflowTable extends React.Component {
  static propTypes = {
    workflows: PropTypes.arrayOf(CustomPropTypes.Event),
  };

  render() {
    const className = '';
    const fixedDimensions = null;

    const cx = classNames('table events-table', className); // TODO: style name
    const {orgId, projectId, groupId} = this.props.params;
    const workflows = this.props.workflows;
    const tagList = [{key: '1', name: 'mama'}];

    return (
      <table className={cx}>
        <thead>
          <tr>
            <th>{t('Workflow')}</th>
          </tr>
        </thead>
        <tbody>
          {workflows.map(workflow => {
            return (
              <WorkflowTableRow
                truncate={fixedDimensions}
                key={workflow.id}
                workflow={workflow}
                orgId={orgId}
                projectId={projectId}
                groupId={groupId}
                tagList={tagList}
              />
            );
          })}
        </tbody>
      </table>
    );
  }
}

export default WorkflowTable;
