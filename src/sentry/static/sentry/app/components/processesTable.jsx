import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

import {t} from 'app/locale';
import CustomPropTypes from 'app/climsTypes';
import ProcessesTableRow from 'app/components/processesTableRow';

class ProcessesTable extends React.Component {
  static propTypes = {
    fixedDimensions: PropTypes.bool,
    processes: PropTypes.arrayOf(CustomPropTypes.Process),
  };

  static defaultProps = {
    fixedDimensions: false,
  };

  render() {
    let {className, fixedDimensions, processes} = this.props;

    // TODO: events-table => processes-table
    let cx = classNames('table events-table', className);
    let hasUser = !!processes.find(process => process.user);
    let {orgId, projectId, groupId} = this.props.params;

    return (
      <table className={cx}>
        <thead>
          <tr>
            <th>{t('Instance')}</th>
            <th>{t('Activity')}</th>
          </tr>
        </thead>
        <tbody>
          {processes.map(process => {
            return (
              <ProcessesTableRow
                truncate={fixedDimensions}
                key={process.id}
                process={process}
                orgId={orgId}
                projectId={projectId}
                groupId={groupId}
                hasUser={hasUser}
              />
            );
          })}
        </tbody>
      </table>
    );
  }
}

export default ProcessesTable;
