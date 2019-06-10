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
import UserTaskStore from 'app/stores/userTaskStore';

const UserTaskHeader = createReactClass({
  displayName: 'UserTaskHeader',

  propTypes: {
    userTask: PropTypes.object.isRequired,
    params: PropTypes.object,
  },

  contextTypes: {
    location: PropTypes.object,
    organization: SentryTypes.Organization,
  },

  mixins: [ApiMixin, OrganizationState],

  onToggleMute() {
    let userTask = this.props.group;
    let org = this.context.organization;
    let loadingIndicator = IndicatorStore.add(t('Saving changes..'));

    this.api.bulkUpdate(
      {
        orgId: org.slug,
        itemIds: [group.id],
        data: {
          status: userTask.status === 'ignored' ? 'unresolved' : 'ignored',
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
    let data = this.props.userTask;
    let metadata = data.metadata;
    switch (data.type) {
      case 'error':
        return metadata.value;
      case 'csp':
        return metadata.message;
      default:
        return this.props.userTask.culprit || '';
    }
  },

  buildLinks() {
    return this.props.userTask.tabs.map(tab => {
      return <li className={tab.active ? "active" : ""}>
        <a onClick={() => UserTaskStore.activateTab(tab.id)}>{tab.title}</a>
      </li>
    });
  },

  render() {
    let { userTask } = this.props;

    let className = 'group-detail';

    className += ' type-' + userTask.type;
    className += ' level-' + userTask.level;

    if (userTask.isBookmarked) {
      className += ' isBookmarked';
    }
    if (userTask.hasSeen) {
      className += ' hasSeen';
    }
    if (userTask.status === 'resolved') {
      className += ' isResolved';
    }

    let userTaskId = userTask.id;
    let orgId = this.context.organization.slug;

    let baseUrl = `/${orgId}/user-tasks/`;
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
                <AssigneeSelector id={userTask.id} />
              </div>
            </div>
          </div>
        </div>
        <UserTaskSeenBy group={userTask} />
        <UserTaskActions group={userTask} />
        <NavTabs>
          {this.buildLinks()}
        </NavTabs>
      </div>
    );
  },
});

export default UserTaskHeader;


          // <ListLink to={`${baseUrl}${userTaskId}/`}>
          //   {t('Activity')} <span className="badge animated">{userTask.numComments}</span>
          // </ListLink>
