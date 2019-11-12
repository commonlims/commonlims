import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {substancesGet} from 'app/redux/actions/substance';
import {t} from 'app/locale';
import ListFilters from 'app/components/listFilters';
import ListView from 'app/components/listView';

class Substances extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      groupBy: {value: 'sample'},
    };
    this.onImported = this.onImported.bind(this);
    this.onSavedSearchChange = this.onSavedSearchCreate.bind(this);
    this.onGroup = this.onGroup.bind(this);
    this.onSort = this.onSort.bind(this);
    this.onSearch = this.onSearch.bind(this);
  }

  UNSAFE_componentWillMount() {
    this.loadData('sample.name:sample-5*', this.state.groupBy.value);
  }

  loadData(query, groupBy) {
    if (groupBy === 'sample') {
      this.props.getSubstances(query);
    } else {
      throw new Error('Unsupported groupBy ' + groupBy);
    }
  }

  onSavedSearchCreate() {
    // TODO: Link with redux instead
  }

  getHeaders() {
    return [
      {
        Header: 'Sample name',
        accessor: 'name',
        aggregate: vals => '',
      },
      {
        Header: 'Container',
        id: 'container',
        accessor: d => (d.location ? d.location.container.name : '<No location>'),
      },
      {
        Header: 'Index',
        id: 'index',
        accessor: d => (d.location ? d.location.index : '<No location>'),
        aggregate: vals => '',
      },
      {
        Header: 'Volume',
        id: 'volume',
        accessor: d => (d.properties.volume ? d.properties.volume.value : null),
        aggregate: vals => '',
      },
      {
        Header: 'Sample Type',
        id: 'sample_type',
        accessor: d => (d.properties.sample_type ? d.properties.sample_type.value : null),
        aggregate: vals =>
          Array.from(new Set(vals))
            .sort()
            .join(', '),
      },
      {
        Header: 'Priority',
        id: 'priority',
        accessor: d => d.priority,
        aggregate: vals => '',
      },
      {
        Header: 'Waiting',
        id: 'days_waiting',
        accessor: d => d.days_waiting,
        Cell: row => <b>{1}</b>,
        aggregate: vals => '',
        Aggregated: row => {
          <span />;
        },
      },
    ];
  }

  currentGrouping() {
    if (this.state.groupBy.value == 'sample') {
      // Grouping by sample is the same as not grouping at all
      return [];
    } else {
      return [this.state.groupBy.value];
    }
  }

  onImported() {
    this.props.getSubstances();
  }

  onGroup(e) {
    this.setState({groupBy: {value: e}});
  }

  onSort(e) {}

  onSearch(query, groupBy) {
    this.props.getSubstances(query);
  }

  render() {
    // access={access}
    // orgId={orgId}
    // query={this.state.query}
    // sort={this.state.sort}
    // searchId={searchId}
    // queryCount={this.state.queryCount}
    // queryMaxCount={this.state.queryMaxCount}
    // onSortChange={this.onSortChange}
    // onSavedSearchCreate={this.onSavedSearchCreate}
    // onSidebarToggle={this.onSidebarToggle}
    // isSearchDisabled={this.state.isSidebarVisible}
    // savedSearchList={this.state.savedSearchList}

    // TODO: Rename css classes to something else than stream
    const groupOptions = [
      {key: 'sample', title: t('Sample')},
      {key: 'container', title: t('Container')},
      {key: 'sample_type', title: t('Sample type')},
    ];

    return (
      <div className="stream-row">
        <div className="stream-content">
          <ListFilters
            access={this.props.access}
            onSavedSearchCreate={this.onSavedSearchCreate}
            searchPlaceholder={t('Search for samples, containers, projects and steps')}
            groupOptions={groupOptions}
            grouping={this.state.groupBy.value}
            onGroup={this.onGroup}
            onSearch={this.onSearch}
          />
          <ListView
            columns={this.getHeaders()}
            data={this.props.substances}
            loading={this.props.loading}
          />
        </div>
      </div>
    );
  }
}

Substances.propTypes = {
  getSubstances: PropTypes.func.isRequired,
  substances: PropTypes.arrayOf(PropTypes.shape({})),
  loading: PropTypes.bool,
  access: PropTypes.object,
};

const mapStateToProps = state => {
  return state.substance;
};

const mapDispatchToProps = dispatch => ({
  getSubstances: query => dispatch(substancesGet(query)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Substances);
