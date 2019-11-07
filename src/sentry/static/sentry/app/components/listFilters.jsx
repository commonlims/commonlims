import PropTypes from 'prop-types';
import React from 'react';

import SavedSearchSelector from 'app/components/savedSearchSelector';
import SearchBar from 'app/components/listSearchBar';
import SearchOptions from 'app/components/searchOptions';
import TagStore from 'app/stores/tagStore';
import {connect} from 'react-redux';
import {savedSearchesGet} from 'app/redux/actions/savedSearch';
import {t} from 'app/locale';

class ListFilters extends React.Component {
  static propTypes = {
    access: PropTypes.object.isRequired,
    query: PropTypes.string,
    isSearchDisabled: PropTypes.bool,
    onSort: PropTypes.func,
    onGroup: PropTypes.func,
    onSearch: PropTypes.func,
    onSavedSearchCreate: PropTypes.func.isRequired,
    grouping: PropTypes.string,
    groupOptions: PropTypes.object,
    sortOptions: PropTypes.object,
    searchPlaceholder: PropTypes.string,
    savedSearch: PropTypes.object,
    getSavedSearches: PropTypes.func.isRequired,
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

  componentWillMount() {
    this.props.getSavedSearches();
  }

  render() {
    const {
      query,
      isSearchDisabled,

      onSearch,
      onSavedSearchCreate,
      onSort,
      onGroup,
    } = this.props;

    // For saved search selector:
    // access={access}
    // searchId={searchId}
    // queryCount={queryCount}
    // queryMaxCount={queryMaxCount}
    // query={query}
    // savedSearchList={savedSearchList}
    return (
      <div className="stream-header">
        <div className="row">
          <div className="col-sm-3">
            <SavedSearchSelector
              savedSearchList={this.props.savedSearch.savedSearches}
              access={this.props.access}
              onSavedSearchCreate={onSavedSearchCreate}
              query="placeholder"
            />
          </div>
          <div className="col-sm-9">
            <div className="search-container">
              {this.props.sortOptions && (
                <div className="stream-sort">
                  <SearchOptions
                    options={this.props.sortOptions}
                    selected="name"
                    onSelect={onSort}
                    title={t('Sort by')}
                  />
                </div>
              )}
              {this.props.groupOptions && (
                <div className="stream-sort">
                  <SearchOptions
                    options={this.props.groupOptions}
                    selected={this.props.grouping}
                    onSelect={onGroup}
                    title={t('Group by')}
                  />
                </div>
              )}
              <SearchBar
                query={query || ''}
                onSearch={onSearch}
                placeholder={this.props.searchPlaceholder}
                disabled={isSearchDisabled}
                excludeEnvironment={true}
                supportedTags={TagStore.getAllTags()}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {savedSearch: state.savedSearch};
};

const mapDispatchToProps = dispatch => ({
  getSavedSearches: () => dispatch(savedSearchesGet()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ListFilters);
