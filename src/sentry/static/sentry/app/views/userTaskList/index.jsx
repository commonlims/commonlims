import PropTypes from 'prop-types';
import React from 'react';
import withEnvironmentInQueryString from 'app/utils/withEnvironmentInQueryString'; // REMOVE ME
import Processes from 'app/views/userTaskList/processes';
import {connect} from 'react-redux';
import {tagsGet} from 'app/redux/actions/tag';
// TODO: uncomment these when fixing CLIMS-203
// import {Client} from 'app/api';
// import {fetchOrgMembers} from 'app/actionCreators/members';

class ProcessesContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const {getTags} = this.props;
    getTags();

    // TODO: uncomment this when fixing CLIMS-203
    // this.api = new Client();
    // const {orgId} = this.props.params;
    // fetchOrgMembers(this.api, orgId);
  }

  render() {
    const {tags, loading} = this.state;

    // TODO: display error message if there is a problem fetching tags.
    return (
      <Processes
        hasEnvironmentsFeature={false}
        tags={tags}
        tagsLoading={loading}
        {...this.props}
      />
    );
  }
}

const mapStateToProps = state => state.tag;

const mapDispatchToProps = dispatch => ({
  getTags: () => dispatch(tagsGet('userTask')),
});

ProcessesContainer.propTypes = {
  setProjectNavSection: PropTypes.func,
  getTags: PropTypes.func,
};
ProcessesContainer.displayName = 'ProcessesContainer';

export default withEnvironmentInQueryString(
  connect(mapStateToProps, mapDispatchToProps)(ProcessesContainer)
);
