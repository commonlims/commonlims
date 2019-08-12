import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ApiMixin from 'app/mixins/apiMixin';
import IndicatorStore from 'app/stores/indicatorStore';
import ListLink from 'app/components/listLink';
import NavTabs from 'app/components/navTabs';
import OrganizationState from 'app/mixins/organizationState';
import {t} from 'app/locale';
import SentryTypes from 'app/sentryTypes';

import WorkBatchActions from './actions';
import WorkBatchSeenBy from './seenBy';
import AssigneeSelector from './assigneeSelector';
import WorkBatchStore from 'app/stores/workBatchStore';

const WorkBatchHeader = createReactClass({
  displayName: 'WorkBatchHeader',

  propTypes: {
    workBatch: PropTypes.object.isRequired,
    params: PropTypes.object,
  },

  contextTypes: {
    location: PropTypes.object,
    organization: SentryTypes.Organization,
  },

  mixins: [ApiMixin, OrganizationState],

  onToggleMute() {
    let workBatch = this.props.group;
    let org = this.context.organization;
    let loadingIndicator = IndicatorStore.add(t('Saving changes..'));

    this.api.bulkUpdate(
      {
        orgId: org.slug,
        itemIds: [group.id],
        data: {
          status: workBatch.status === 'ignored' ? 'unresolved' : 'ignored',
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
    let data = this.props.workBatch;
    let metadata = data.metadata;
    switch (data.type) {
      case 'error':
        return metadata.value;
      case 'csp':
        return metadata.message;
      default:
        return this.props.workBatch.culprit || '';
    }
  },

  buildLinks() {
    return this.props.workBatch.tabs.map(tab => {
      return (
        <li className={tab.active ? 'active' : ''}>
          <a onClick={() => WorkBatchStore.activateTab(tab.id)}>{tab.title}</a>
        </li>
      );
    });
  },

  render() {
    let {workBatch} = this.props;

    let className = 'group-detail';

    className += ' type-' + workBatch.type;
    className += ' level-' + workBatch.level;

    if (workBatch.isBookmarked) {
      className += ' isBookmarked';
    }
    if (workBatch.hasSeen) {
      className += ' hasSeen';
    }
    if (workBatch.status === 'resolved') {
      className += ' isResolved';
    }

    let workBatchId = workBatch.id;
    let orgId = this.context.organization.slug;

    let baseUrl = `/${orgId}/work-batches/`;
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
                <AssigneeSelector id={workBatch.id} />
              </div>
            </div>
          </div>
        </div>
        <WorkBatchSeenBy group={workBatch} />
        <WorkBatchActions group={workBatch} />
        <NavTabs>{this.buildLinks()}</NavTabs>
      </div>
    );
  },
});

export default WorkBatchHeader;

// <ListLink to={`${baseUrl}${workBatchId}/`}>
//   {t('Activity')} <span className="badge animated">{workBatch.numComments}</span>
// </ListLink>
