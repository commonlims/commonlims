import PropTypes from 'prop-types';
import React from 'react';
import {Link} from 'react-router';
import styled from 'react-emotion';

import SentryTypes from 'app/sentryTypes';
import ProjectLink from 'app/components/projectLink';
import DropdownLink from 'app/components/dropdownLink';
import MenuItem from 'app/components/menuItem';
import Button from 'app/components/button';
import NavTabs from 'app/components/navTabs';

import {t} from 'app/locale';

import {
  setActiveEnvironment,
  clearActiveEnvironment,
} from 'app/actionCreators/environments';

// NOLIMS: In clims, the projects are not as central as in sentry. The user might want
// to filter on it, but not all the time, so this header is really not a "ProjectHeader" but
// just the general page header
class ProjectHeader extends React.Component {
  static propTypes = {
    project: PropTypes.object.isRequired,
    organization: PropTypes.object.isRequired,
    environments: PropTypes.array.isRequired,
    activeSection: PropTypes.string,
    activeEnvironment: SentryTypes.Environment,
  };

  static defaultProps = {
    environments: [],
  };

  render() {
    const {project, environments, activeEnvironment} = this.props;
    const navSection = this.props.activeSection;
    const org = this.props.organization;
    const allEnvironmentsLabel = t('All environments');

    const pagesWithEnvironments = new Set([
      'stream',
      'releases',
      'dashboard',
      'events',
      'user-feedback',
    ]);
    const showEnvironmentsToggle = pagesWithEnvironments.has(navSection);

    const activeEnvironmentTitle = activeEnvironment
      ? activeEnvironment.displayName
      : allEnvironmentsLabel;

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

const EnvironmentsToggle = styled('div')`
  display: flex;
  position: relative;
`;

export default ProjectHeader;
