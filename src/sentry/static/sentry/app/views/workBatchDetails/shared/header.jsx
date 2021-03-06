import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ApiMixin from 'app/mixins/apiMixin';
import NavTabs from 'app/components/navTabs';
import OrganizationState from 'app/mixins/organizationState';
import {t} from 'app/locale';
import SentryTypes from 'app/sentryTypes';

import WorkBatchActions from './actions';
import WorkBatchSeenBy from './seenBy';

const WorkBatchHeader = createReactClass({
  displayName: 'WorkBatchHeader',

  propTypes: {
    workBatch: PropTypes.object.isRequired,
    workDefinition: PropTypes.object.isRequired,
    tabSelected: PropTypes.func.isRequired,
  },

  contextTypes: {
    location: PropTypes.object,
    organization: SentryTypes.Organization,
  },

  mixins: [ApiMixin, OrganizationState],

  buildLinks() {
    return this.props.workBatch.tabs.map((tab) => {
      const active = tab.title === this.props.selectedTab.title;
      return (
        <li className={active ? 'active' : ''} key={tab.title}>
          <a onClick={() => this.props.tabSelected(tab)}>{tab.title}</a>
        </li>
      );
    });
  },

  render() {
    const {workBatch} = this.props;

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

    return (
      <div className={className}>
        <div className="row">
          <div className="col-sm-7">
            <h3>{this.props.workBatch.name}</h3>
            <h6>{this.props.workBatch.processDefinitionKey}</h6>
          </div>
          <div className="col-sm-5 stats">
            <div className="flex flex-justify-right">
              <div className="assigned-to">
                <h6 className="nav-header">{t('Assignee')}</h6>
                {/*<AssigneeSelector id={this.props.workBatch.id} /> */}
              </div>
            </div>
          </div>
        </div>
        <WorkBatchSeenBy group={workBatch} />
        <WorkBatchActions group={workBatch} workDefinition={this.props.workDefinition} />
        <NavTabs>{this.buildLinks()}</NavTabs>
      </div>
    );
  },
});

export default WorkBatchHeader;
