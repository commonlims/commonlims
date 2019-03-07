import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ApiMixin from 'app/mixins/apiMixin';
import IndicatorStore from 'app/stores/indicatorStore';
import ListLink from 'app/components/listLink';
import NavTabs from 'app/components/navTabs';
import OrganizationState from 'app/mixins/organizationState';
import { t } from 'app/locale';
import SentryTypes from 'app/sentryTypes';

import UserTaskActions from './actions';
import UserTaskSeenBy from './seenBy';
import AssigneeSelector from './assigneeSelector';

const UserTaskHeader = createReactClass({
  displayName: 'UserTaskHeader',

  propTypes: {
    group: SentryTypes.Group.isRequired,
    project: SentryTypes.Project,
    params: PropTypes.object,
  },

  contextTypes: {
    location: PropTypes.object,
    organization: SentryTypes.Organization,
  },

  mixins: [ApiMixin, OrganizationState],

  onToggleMute() {
    let group = this.props.group;
    let org = this.context.organization;
    let loadingIndicator = IndicatorStore.add(t('Saving changes..'));

    this.api.bulkUpdate(
      {
        orgId: org.slug,
        projectId: group.project.slug,
        itemIds: [group.id],
        data: {
          status: group.status === 'ignored' ? 'unresolved' : 'ignored',
        },
      },
      {
        complete: () => {
          IndicatorStore.remove(loadingIndicator);
        },
      }
    );
  },

  getMessage() {
    let data = this.props.group;
    let metadata = data.metadata;
    switch (data.type) {
      case 'error':
        return metadata.value;
      case 'csp':
        return metadata.message;
      default:
        return this.props.group.culprit || '';
    }
  },

  render() {
    let { project, group, params } = this.props;

    let className = 'group-detail';

    className += ' type-' + group.type;
    className += ' level-' + group.level;

    if (group.isBookmarked) {
      className += ' isBookmarked';
    }
    if (group.hasSeen) {
      className += ' hasSeen';
    }
    if (group.status === 'resolved') {
      className += ' isResolved';
    }

    let groupId = group.id;
    let orgId = this.context.organization.slug;

    let baseUrl = `/${orgId}/${params.projectId}/user-tasks/`;
    let userActionTitle = 'Fragment analyzer'; // TODO

    return (
      <div className={className}>
        <div className="row">
          <div className="col-sm-7">
            <h3>
              {/* TODO: UI clips */}
              {userActionTitle}
            </h3>
          </div>
          <div className="col-sm-5 stats">
            <div className="flex flex-justify-right">
              <div className="assigned-to">
                <h6 className="nav-header">{t('Assignee')}</h6>
                <AssigneeSelector id={group.id} />
              </div>
            </div>
          </div>
        </div>
        <UserTaskSeenBy group={group} />
        <UserTaskActions group={group} project={project} />
        <NavTabs>
          <ListLink to={`${baseUrl}${groupId}/samples/`}>{t('Samples')}</ListLink>
          <ListLink
            to={`${baseUrl}${groupId}/`}
            isActive={() => {
              let rootGroupPath = `${baseUrl}${groupId}/`;
              let pathname = this.context.location.pathname;

              // Because react-router 1.0 removes router.isActive(route)
              return pathname === rootGroupPath || /events\/\w+\/$/.test(pathname);
            }}
          >
            {t('Details')}
          </ListLink>
          <ListLink to={`${baseUrl}${groupId}/files/`}>{t('Files')}</ListLink>
          <ListLink to={`${baseUrl}${groupId}/activity/`}>
            {t('Activity')} <span className="badge animated">{group.numComments}</span>
          </ListLink>
        </NavTabs>
      </div>
    );
  },
});

export default UserTaskHeader;
