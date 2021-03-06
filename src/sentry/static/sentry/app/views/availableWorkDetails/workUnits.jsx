import React from 'react';
import {t} from 'app/locale';
import PropTypes from 'prop-types';
import ListView from 'app/components/listView';
import {browserHistory} from 'react-router';

import BackButton from 'app/components/backButton';
import ListActionBar from 'app/components/listActionBar';
import LoadingIndicator from 'app/components/loadingIndicator';
import ClimsTypes from 'app/climsTypes';

export default class WorkUnits extends React.Component {
  redirectOnCreated(data) {
    const createdId = data.id;
    const org = this.props.organization;

    browserHistory.push(`/${org.slug}/work-batches/${createdId}/`);
  }

  listActionBar() {
    const len = this.props.availableWorkUnit.listViewState.selectedIds.size;
    return (
      <ListActionBar>
        <div className="btn-group">
          <button
            className="btn btn-sm btn-default"
            disabled={len == 0 || this.props.creatingWorkBatch}
            onClick={() =>
              this.props.createWorkBatch(
                this.props.organization,
                {work_units: this.props.availableWorkUnit.listViewState.selectedIds},
                this.redirectOnCreated.bind(this)
              )
            }
          >
            {`Start work`}
          </button>
        </div>
      </ListActionBar>
    );
  }

  render() {
    if (this.props.loading) {
      return <LoadingIndicator />;
    }

    const actionBar = this.listActionBar();
    return (
      <div>
        <ListView
          orgId={this.props.organization.id}
          columns={this.props.columns}
          dataById={this.props.availableWorkUnit.byIds}
          visibleIds={this.props.availableWorkUnit.listViewState.visibleIds}
          selectedIds={this.props.availableWorkUnit.listViewState.selectedIds}
          allVisibleSelected={
            this.props.availableWorkUnit.listViewState.allVisibleSelected
          }
          loading={this.props.substancesLoading}
          canSelect
          listActionBar={actionBar}
          toggleSingle={this.props.toggleSingle}
          toggleAll={this.props.toggleAll}
        />
      </div>
    );
  }
}

// TODO: use well defined prop types
WorkUnits.propTypes = {
  ...ClimsTypes.List,

  organization: PropTypes.exact({
    id: PropTypes.string,
  }),
  columns: PropTypes.array,
  substancesLoading: PropTypes.bool,
  toggleSingle: PropTypes.func,
  toggleAll: PropTypes.func,
  createWorkBatch: PropTypes.func,
  workDefinition: ClimsTypes.WorkDefinition.isRequired,
};
