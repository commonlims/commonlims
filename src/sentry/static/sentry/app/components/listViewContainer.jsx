import React from 'react';
import {browserHistory} from 'react-router';

import ListView from 'app/components/listView';
import ListFilters from 'app/components/listFilters';
import ClimsTypes from 'app/climsTypes';
import SentryTypes from 'app/sentryTypes';
import Pagination from 'app/components/pagination';

// A wrapper around the presentational components ListView, ListFilters and Pagination,
// that handles actions in the view
//
// TODO: Use this in the substance view. It's based on that.

class ListViewContainer extends React.Component {
  constructor(props) {
    super(props);
    this.onSavedSearchCreate = this.onSavedSearchCreate.bind(this);
    this.onGroup = this.onGroup.bind(this);
    this.onSort = this.onSort.bind(this);
    this.onSearch = this.onSearch.bind(this);
    this.toggleAll = this.toggleAll.bind(this);
    this.onCursor = this.onCursor.bind(this);

    let {search, groupBy} = this.props;
    let {cursor} = this.props.listViewState.pagination;

    const query = this.props.location.query;
    if (query) {
      search = query.search ? query.search : search;
      cursor = query.cursor ? query.cursor : cursor;
      groupBy = query.groupBy ? query.groupBy : groupBy;
    }

    this.onSearch(search, groupBy, cursor);
  }

  onSearch(search, groupBy, cursor) {
    // Corresponding in substance search:
    // const isGroupHeader = groupBy !== 'substance';
    // this.props.substanceSearchEntriesGet(search, groupBy, cursor, isGroupHeader);

    this.props.getEntries(search, groupBy, cursor); // TODO: not implemented for workbatch

    // Add search to history
    const location = this.props.location;
    const query = {
      ...location.query,
      search,
      groupBy,
      cursor,
    };

    // TODO: Might want to do this at the caller's (with an event) so we don't mess up the URL
    // if the caller doesn't want it. Or have a prop setting for this.
    browserHistory.push({
      pathname: location.pathname,
      query,
    });
  }

  onGroup(groupBy) {
    this.setState({groupBy: {value: groupBy}});
    const {search} = this.props;
    const {cursor} = this.props.pagination;
    this.onSearch(search, groupBy, cursor);
  }

  onSort(e) {}

  onCursor(cursor) {
    const {search, groupBy} = this.props;
    this.onSearch(search, groupBy, cursor);
  }

  onSavedSearchCreate() {
    // TODO
  }

  toggleAll() {
    this.props.toggleSelectAll(null);
  }

  render() {
    return (
      <div className="stream-row">
        <div className="stream-content">
          <ListFilters
            access={this.props.access}
            onSavedSearchCreate={this.onSavedSearchCreate}
            searchPlaceholder={this.props.searchHelpText}
            groupOptions={this.props.groupOptions}
            grouping={this.props.listViewState.groupBy}
            onGroup={this.onGroup}
            onSearch={this.onSearch}
            orgId={this.props.organization.id}
            query={this.props.listViewState.search} // Rename to search
          />
          <ListView
            orgId={this.props.organization.id}
            columns={this.props.columns()}
            dataById={this.props.byIds}
            visibleIds={this.props.listViewState.visibleIds}
            selectedIds={this.props.listViewState.selectedIds}
            loading={this.props.loading}
            canSelect={this.props.canSelect}
            allVisibleSelected={this.props.listViewState.allVisibleSelected}
            toggleAll={this.toggleAll}
            toggleSingle={this.props.toggleSingle}
            listActionBar={null}
          />
          {this.props.paginationEnabled &&
            this.props.pagination.pageLinks && (
              <Pagination
                pageLinks={this.props.pagination.pageLinks}
                onCursor={this.onCursor}
              />
            )}
        </div>
      </div>
    );
  }
}

ListViewContainer.propTypes = {
  ...ClimsTypes.List,
  organization: SentryTypes.Organization,
};

export default ListViewContainer;
