import PropTypes from 'prop-types';
import React from 'react';
import withEnvironmentInQueryString from 'app/utils/withEnvironmentInQueryString';
import Tasks from 'app/views/taskList/tasks';
import {connect} from 'react-redux';
import {tagsGet} from 'app/redux/actions/tag';

class TaskList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const {getTags} = this.props;
    getTags();
  }

  render() {
    const {tags, loading} = this.state;

    // TODO: display error message if there is a problem fetching tags.
    return <Tasks tags={tags} tagsLoading={loading} {...this.props} />;
  }
}

const mapStateToProps = state => state.tag;

const mapDispatchToProps = dispatch => ({
  getTags: () => dispatch(tagsGet('task')),
});

TaskList.propTypes = {
  getTags: PropTypes.func,
};
TaskList.displayName = 'TaskList';

export default withEnvironmentInQueryString(
  connect(mapStateToProps, mapDispatchToProps)(TaskList)
);
