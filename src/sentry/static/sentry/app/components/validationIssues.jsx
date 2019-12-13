import React from 'react';
import ListView from 'app/components/listView';
import {getIssueIcon} from 'app/components/icons';
import PropTypes from 'prop-types';

export class ValidationIssues extends React.Component {
  static propTypes = {
    issues: PropTypes.array,
  };

  getHeaders() {
    return [
      {
        Header: '',
        id: 'type',
        accessor: row => {
          return getIssueIcon(row.type, true);
        },
      },
      {
        Header: 'Row',
        id: 'row',
        accessor: 'row',
      },
      {
        Header: 'Col',
        id: 'column',
        accessor: 'column',
      },
      {
        Header: 'Message',
        id: 'msg',
        accessor: 'msg',
      },
    ];
  }

  render() {
    if (this.props.issues.length === 0) {
      return null;
    }

    const dataById = {};
    const visibleIds = [];

    for (let i = 0; i < this.props.issues.length; i++) {
      dataById[i] = this.props.issues[i];
      visibleIds.push(i);
    }

    const selectedIds = new Set();

    return (
      <ListView
        columns={this.getHeaders()}
        dataById={dataById}
        visibleIds={visibleIds}
        selectedIds={selectedIds}
        loading={false}
        canSelect={false}
        allVisibleSelected={false}
        listActionBar={null}
        toggleAll={() => {}}
        toggleSingle={() => {}}
      />
    );
  }
}
