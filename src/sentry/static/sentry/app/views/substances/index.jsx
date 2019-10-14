import React from 'react';
import withEnvironmentInQueryString from 'app/utils/withEnvironmentInQueryString'; // REMOVE ME
import Substances from 'app/views/substances/substances';
import {connect} from 'react-redux';

class SubstancesContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  render() {
    return <Substances />;
  }
}

const mapStateToProps = state => state.tag;
const mapDispatchToProps = dispatch => ({});

SubstancesContainer.propTypes = {};
SubstancesContainer.displayName = 'SubstancesContainer';

export default withEnvironmentInQueryString(
  connect(mapStateToProps, mapDispatchToProps)(SubstancesContainer)
);
