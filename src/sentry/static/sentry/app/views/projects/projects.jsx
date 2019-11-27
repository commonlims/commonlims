import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {projectSearchEntriesGet} from 'app/redux/actions/projectSearchEntry';
import {t} from 'app/locale';
import ListFilters from 'app/components/listFilters';
import ListView from 'app/components/listView';
import SentryTypes from 'app/sentryTypes';

class Projects extends React.Component {
  constructor(props) {
    super(props);
    const {query, groupBy} = this.props;
    this.props.projectSearchEntriesGet(query, groupBy);
  }

  getHeaders() {
    // TODO: This should be returned as a contract from the plugin that is registered for this.
    return [
      {
        Header: 'Project name',
        id: 'name',
        accessor: 'name',
      },
      {
        Header: 'PI',
        id: 'pi',
        accessor: 'pi',
      },
    ];
  }

  onGroup(e) {
    this.setState({groupBy: {value: e}});
  }

  onSearch(query, groupBy) {
    this.props.projectSearchEntriesGet(query, groupBy);
  }

  render() {
    // TODO: Rename css classes to something else than stream
    const groupOptions = [
      {key: 'project_type', title: t('Project type')},
      {key: 'pi', title: t('PI')},
      {key: 'name', title: t('Project name')},
    ];

    return (
      <div className="stream-row">
        <div className="stream-content">
          <ListFilters
            access={this.props.access}
            onSavedSearchCreate={this.onSavedSearchCreate}
            searchPlaceholder={t('Search for projects')}
            groupOptions={groupOptions}
            grouping={this.props.groupBy}
            onGroup={this.onGroup}
            onSearch={this.onSearch}
            orgId={this.props.organization.id}
            query={this.props.query}
          />
          <ListView
            orgId={this.props.organization.id}
            columns={this.getHeaders()}
            dataById={this.props.projectSearchEntry.byIds}
            canSelect={false}
            visibleIds={Object.keys(this.props.projectSearchEntry.byIds)}
          />
        </div>
      </div>
    );
  }
}

Projects.propTypes = {
  access: PropTypes.object,
  organization: SentryTypes.Organization.isRequired,
  groupBy: PropTypes.string.isRequired,
  projectSearchEntriesGet: PropTypes.func.isRequired,
  byIds: PropTypes.object,
  projectSearchEntry: PropTypes.object,
  query: PropTypes.string,
};

const mapStateToProps = state => {
  return {
    projectSearchEntry: state.projectSearchEntry,
  };
};

const mapDispatchToProps = dispatch => ({
  projectSearchEntriesGet: query => dispatch(projectSearchEntriesGet(query)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Projects);
