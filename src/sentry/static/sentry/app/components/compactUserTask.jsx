import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Reflux from 'reflux';
import {Flex, Box} from 'grid-emotion';

import ApiMixin from 'app/mixins/apiMixin';
import IndicatorStore from 'app/stores/indicatorStore';
import DropdownLink from 'app/components/dropdownLink';
import SnoozeAction from 'app/components/issues/snoozeAction';
import GroupStore from 'app/stores/groupStore';
import Link from 'app/components/link';
import ProjectLink from 'app/components/projectLink';
import {t} from 'app/locale';
import {PanelItem} from 'app/components/panels';
import SentryTypes from 'app/sentryTypes';
import withOrganization from 'app/utils/withOrganization';

class CompactUserTaskHeader extends React.Component {
  static propTypes = {
    organization: SentryTypes.Organization.isRequired,
    data: PropTypes.object.isRequired,
  };

  getTitle = () => {
    let data = this.props.data;
    data['type'] = 'error';

    return (
      <span>
        <span style={{marginRight: 10}}>{data.taskTitle}</span>
      </span>
    );
  };

  getMessage = () => {
    let data = this.props.data;
    return data.processTitle;
  };

  render() {
    let {data, organization} = this.props;

    let hasNewRoutes = new Set(organization.features).has('sentry10');

    let styles = {};

    let basePath = hasNewRoutes
      ? `/organizations/${organization.slug}/issues/`
      : `/${organization.slug}/user-tasks/`;
    if (data.subscriptionDetails && data.subscriptionDetails.reason === 'mentioned') {
      styles = {color: '#57be8c'};
    }
    return (
      <React.Fragment>
        <Flex align="center">
          <Box mr={1}>
            <span className="error-level truncate" title="warn" />
          </Box>
          <h3 className="truncate">
            <ProjectLink to={`${basePath}${data.id}/`}>
              <span className="icon icon-soundoff" />
              <span className="icon icon-star-solid" />
              {this.getTitle()}
            </ProjectLink>
          </h3>
        </Flex>
        <div className="event-extra">
          {data.numComments !== 0 && (
            <span>
              <Link to={`${basePath}${data.id}/activity/`} className="comments">
                <span className="icon icon-comments" style={styles} />
                <span className="tag-count">{data.numComments}</span>
              </Link>
            </span>
          )}
          <span className="culprit">{this.getMessage()}</span>
        </div>
      </React.Fragment>
    );
  }
}

const CompactUserTask = createReactClass({
  displayName: 'CompactUserTask',

  propTypes: {
    data: PropTypes.object,
    id: PropTypes.string,
    statsPeriod: PropTypes.string,
    showActions: PropTypes.bool,
    organization: SentryTypes.Organization.isRequired,
  },

  mixins: [ApiMixin, Reflux.listenTo(GroupStore, 'onGroupChange')],

  getInitialState() {
    return {
      issue: this.props.data || GroupStore.get(this.props.id),
    };
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.id != this.props.id) {
      this.setState({
        issue: GroupStore.get(this.props.id),
      });
    }
  },

  onGroupChange(itemIds) {
    if (!itemIds.has(this.props.id)) {
      return;
    }
    let id = this.props.id;
    let issue = GroupStore.get(id);
    this.setState({
      issue,
    });
  },

  onSnooze(duration) {
    let data = {
      status: 'ignored',
    };

    if (duration) data.ignoreDuration = duration;

    this.onUpdate(data);
  },

  onUpdate(data) {
    let issue = this.state.issue;
    let loadingIndicator = IndicatorStore.add(t('Saving changes..'));

    this.api.bulkUpdate(
      {
        orgId: this.props.organization.slug,
        itemIds: [issue.id],
        data,
      },
      {
        complete: () => {
          IndicatorStore.remove(loadingIndicator);
        },
      }
    );
  },

  render() {
    let issue = this.state.issue;
    let {id, organization} = this.props;

    let className = 'issue';
    if (issue.isBookmarked) {
      className += ' isBookmarked';
    }
    if (issue.hasSeen) {
      className += ' hasSeen';
    }
    if (issue.status === 'resolved') {
      className += ' isResolved';
    }
    if (issue.status === 'ignored') {
      className += ' isIgnored';
    }

    className += ' level-' + issue.level;

    if (this.props.statsPeriod) {
      className += ' with-graph';
    }

    let title = <span className="icon-more" />;

    return (
      <PanelItem
        className={className}
        onClick={this.toggleSelect}
        direction="column"
        style={{paddingTop: '12px', paddingBottom: '6px'}}
      >
        <CompactUserTaskHeader data={issue} organization={organization} />
        {this.props.showActions && (
          <div className="more-menu-container align-right">
            <DropdownLink
              topLevelClasses="more-menu"
              className="more-menu-toggle"
              caret={false}
              title={title}
            >
              <li>
                <a
                  onClick={this.onUpdate.bind(this, {
                    status: issue.status !== 'resolved' ? 'resolved' : 'unresolved',
                  })}
                >
                  <span className="icon-checkmark" />
                </a>
              </li>
              <li>
                <a
                  onClick={this.onUpdate.bind(this, {isBookmarked: !issue.isBookmarked})}
                >
                  <span className="icon-star-solid" />
                </a>
              </li>
              <li>
                <SnoozeAction
                  orgId={organization.slug}
                  groupId={id}
                  onSnooze={this.onSnooze}
                />
              </li>
            </DropdownLink>
          </div>
        )}
        {this.props.children}
      </PanelItem>
    );
  },
});

export {CompactUserTask};
export default withOrganization(CompactUserTask);
