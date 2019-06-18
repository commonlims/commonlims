import PropTypes from 'prop-types';
import React from 'react';

import SavedSearchSelector from 'app/views/userTaskList/savedSearchSelector';
import SearchBar from 'app/views/userTaskList/searchBar';
import {t} from 'app/locale';

class ProcessesFilters extends React.Component {
  static propTypes = {
    orgId: PropTypes.string.isRequired,

    searchId: PropTypes.string,
    savedSearchList: PropTypes.array.isRequired,

    query: PropTypes.string,
    isSearchDisabled: PropTypes.bool,
    queryCount: PropTypes.number,
    queryMaxCount: PropTypes.number,

    onSearch: PropTypes.func,
    onSidebarToggle: PropTypes.func,
    onSavedSearchCreate: PropTypes.func.isRequired,
    access: PropTypes.string,
  };

  static contextTypes = {
    location: PropTypes.object,
  };

  static defaultProps = {
    sort: '',
    query: null,
    onSortChange: function() {},
    onSearch: function() {},
    onSidebarToggle: function() {},
  };

  render() {
    let {
      access,
      orgId,
      searchId,
      queryCount,
      queryMaxCount,
      query,
      savedSearchList,
      isSearchDisabled,

      onSidebarToggle,
      onSearch,
      onSavedSearchCreate,
    } = this.props;

    return (
      <div className="stream-header">
        <div className="row">
          <div className="col-sm-5">
            <SavedSearchSelector
              access={access}
              orgId={orgId}
              searchId={searchId}
              queryCount={queryCount}
              queryMaxCount={queryMaxCount}
              query={query}
              onSavedSearchCreate={onSavedSearchCreate}
              savedSearchList={savedSearchList}
            />
          </div>
          <div className="col-sm-7">
            <div className="search-container">
              <SearchBar
                orgId={orgId}
                placeholder={t('Search for events, users, tags, and everything else.')}
                query={query || ''}
                onSearch={onSearch}
                disabled={isSearchDisabled}
                excludeEnvironment={true}
              />
              <a
                className="btn btn-default toggle-stream-sidebar"
                onClick={onSidebarToggle}
              >
                <span className="icon-filter" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ProcessesFilters;
