import PropTypes from 'prop-types';
import React from 'react';

import ProjectLink from 'app/components/projectLink';
import NavTabs from 'app/components/navTabs';

import {t} from 'app/locale';

// NOLIMS: In clims, the projects are not as central as in sentry. The user might want
// to filter on it, but not all the time, so this header is really not a "ProjectHeader" but
// just the general page header
class ProjectHeader extends React.Component {
  static propTypes = {
    project: PropTypes.object.isRequired,
    organization: PropTypes.object.isRequired,
    activeSection: PropTypes.string,
  };

  static defaultProps = {
    environments: [],
  };

  render() {
    const {project} = this.props;
    const navSection = this.props.activeSection;
    const org = this.props.organization;

    return (
      <div className="sub-header flex flex-container flex-vertically-centered">
        <div className="project-header">
          <div className="project-header-main">
            {/*<div className="project-select-wrapper">
                 <ProjectSelector organization={org} projectId={project.slug} />
                 <BookmarkToggle />
             </div>*/}

            <NavTabs>
              <li className={navSection == 'dashboard' ? 'active' : ''}>
                <ProjectLink to={`/${org.slug}/${project.slug}/dashboard/`}>
                  {t('Overview')}
                </ProjectLink>
              </li>
              <li className={navSection == 'processes' ? 'active' : ''}>
                <ProjectLink to={`/${org.slug}/${project.slug}/tasks/`}>
                  {t('Tasks')}
                </ProjectLink>
              </li>
              <li className={navSection == 'samples' ? 'active' : ''}>
                <ProjectLink to={`/${org.slug}/${project.slug}/samples/`}>
                  {t('Samples')}
                </ProjectLink>
              </li>
            </NavTabs>
          </div>
        </div>
      </div>
    );
  }
}

export default ProjectHeader;
