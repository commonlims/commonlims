import {withRouter} from 'react-router';
import React from 'react';
import Reflux from 'reflux';
import createReactClass from 'create-react-class';

import {setLastRoute} from 'app/actionCreators/navigation';
import EnvironmentStore from 'app/stores/environmentStore';
import ProjectState from 'app/mixins/projectState';
import withEnvironment from 'app/utils/withEnvironment';
import GuideAnchor from 'app/components/assistant/guideAnchor';

const ProjectDetailsLayout = createReactClass({
  displayName: 'ProjectDetailsLayout',

  mixins: [ProjectState, Reflux.connect(EnvironmentStore, 'environments')],

  getInitialState() {
    return {
      environments: EnvironmentStore.getActive() || [],
      projectNavSection: null,
    };
  },

  componentWillUnmount() {
    const {location} = this.props;
    const {pathname, search} = location;
    // Save last route so that we can jump back to view from settings
    setLastRoute(`${pathname}${search || ''}`);
  },

  /**
   * This callback can be invoked by the child component
   * to update the active nav section (which is then passed
   * to the ProjectHeader
   */
  setProjectNavSection(section) {
    this.setState({
      projectNavSection: section,
    });
  },

  render() {
    if (!this.context.project) {
      return null;
    }

    return (
      <React.Fragment>
        <GuideAnchor target="project_details" type="invisible" />
        <div className="container">
          <div className="content">
            {React.cloneElement(this.props.children, {
              setProjectNavSection: this.setProjectNavSection,
              memberList: this.state.memberList,
            })}
          </div>
        </div>
      </React.Fragment>
    );
  },
});

export {ProjectDetailsLayout};
export default withRouter(withEnvironment(ProjectDetailsLayout));
