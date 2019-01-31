import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

import {t} from 'app/locale';
import CustomPropTypes from 'app/sentryTypes';
import EventsTableRow from 'app/components/eventsTable/eventsTableRow';

class WorkflowTable extends React.Component {
  static propTypes = {
    workflows: PropTypes.arrayOf(CustomPropTypes.Event),
  };

  static defaultProps = {
    fixedDimensions: false,
  };

  render() {
    // let {className, events, fixedDimensions, tagList} = this.props;

    let cx = classNames('table events-table', className);  // TODO: style name
    // let hasUser = !!events.find(event => event.user);
    // let {orgId, projectId, groupId} = this.props.params;
    let tagList = [{"key": "1", "name": "mama"}];
    let workflows = [
        
    ];

    return (
      <table className={cx}>
        <thead>
          <tr>
            <th>{t('ID')}</th>
            <th>bro</th>

            {tagList.map(tag => {
              return <th key={tag.key}>{tag.name}</th>;
            })}
          </tr>
        </thead>
        <tbody>
          {workflows.map(workflow => {
            return (
              <EventsTableRow
                truncate={fixedDimensions}
                key={workflow.id}
                workflow={workflow}
                orgId={orgId}
                projectId={projectId}
                groupId={groupId}
                tagList={tagList}
                hasUser={hasUser}
              />
            );
          })}
        </tbody>
      </table>);
  }
}

export default WorkflowTable;
