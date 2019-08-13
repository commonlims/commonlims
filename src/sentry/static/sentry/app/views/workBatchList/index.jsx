import PropTypes from 'prop-types';
import React from 'react';
import withEnvironmentInQueryString from 'app/utils/withEnvironmentInQueryString'; // REMOVE ME
import WorkBatches from 'app/views/workBatchList/workBatches';
import {connect} from 'react-redux';
import {tagsGet} from 'app/redux/actions/tag';
// TODO: uncomment these when fixing CLIMS-203
// import {Client} from 'app/api';
// import {fetchOrgMembers} from 'app/actionCreators/members';

class WorkBatchList extends React.Component {
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
    return <WorkBatches tags={tags} tagsLoading={loading} {...this.props} />;
  }
}

const mapStateToProps = state => state.tag;

const mapDispatchToProps = dispatch => ({
  getTags: () => dispatch(tagsGet('workBatch')),
});

WorkBatchList.propTypes = {
  getTags: PropTypes.func,
};
WorkBatchList.displayName = 'WorkBatchList';

export default withEnvironmentInQueryString(
  connect(mapStateToProps, mapDispatchToProps)(WorkBatchList)
);
