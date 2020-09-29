import PropTypes from 'prop-types';
import React from 'react';
import withEnvironmentInQueryString from 'app/utils/withEnvironmentInQueryString';
import WorkUnits from 'app/views/workUnitList/workUnits';
import {connect} from 'react-redux';
import {tagsGet} from 'app/redux/actions/tag';

class WorkUnitList extends React.Component {
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

    return <b>stuffo</b>;
    // TODO: display error message if there is a problem fetching tags.
    // return <WorkUnits tags={tags} tagsLoading={loading} {...this.props} />;
  }
}

const mapStateToProps = (state) => state.tag;

const mapDispatchToProps = (dispatch) => ({
  getTags: () => dispatch(tagsGet('workUnit')),
});

WorkUnitList.propTypes = {
  getTags: PropTypes.func,
};
WorkUnitList.displayName = 'WorkUnitList';

export default withEnvironmentInQueryString(
  connect(mapStateToProps, mapDispatchToProps)(WorkUnitList)
);
