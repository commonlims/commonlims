import PropTypes from 'prop-types';
import React from 'react';
import Reflux from 'reflux';
import createReactClass from 'create-react-class';
import SentryTypes from 'app/sentryTypes';
import ProcessTagStore from 'app/stores/processTagStore'; // REMOVE ME
import withEnvironmentInQueryString from 'app/utils/withEnvironmentInQueryString';
import Processes from 'app/views/userTaskList/processes';
import ProjectState from 'app/mixins/projectState';
import TagStore from 'app/stores/tagStore'; // REMOVE ME
import {fetchTags} from 'app/actionCreators/tags'; // REMOVE ME
import {connect} from 'react-redux';
import {tagsGet} from 'app/redux/actions/tag';
// TODO: uncomment these when fixing CLIMS-203
// import {Client} from 'app/api';
// import {fetchOrgMembers} from 'app/actionCreators/members';

const ProcessesContainer = createReactClass({
  displayName: 'ProcessesContainer',
  propTypes: {
    environment: SentryTypes.Environment,
    setProjectNavSection: PropTypes.func,
    getTags: PropTypes.func,
  },

  mixins: [ProjectState, Reflux.listenTo(TagStore, 'onTagsChange')],

  getInitialState() {
    return {
      tags: ProcessTagStore.getAllTags(),
      tagsLoading: true,
    };
  },

  componentWillMount() {
    const {getTags} = this.props;
    const {orgId, projectId} = this.props.params;
    fetchTags(orgId, projectId);
    getTags();
    // TODO: uncomment this when fixing CLIMS-203
    // this.api = new Client();
    // fetchOrgMembers(this.api, orgId);
  },

  onTagsChange(tags) {
    this.setState({
      tags,
      tagsLoading: false,
    });
  },

  render() {
    const {tags} = this.state;

    // TODO: read tagsLoading from state instead
    return (
      <Processes
        hasEnvironmentsFeature={false}
        tags={tags}
        tagsLoading={false}
        {...this.props}
      />
    );
  },
});

const mapStateToProps = state => state.tag;

const mapDispatchToProps = dispatch => ({
  getTags: () => dispatch(tagsGet('userTask')),
});

export default withEnvironmentInQueryString(
  connect(mapStateToProps, mapDispatchToProps)(ProcessesContainer)
);
