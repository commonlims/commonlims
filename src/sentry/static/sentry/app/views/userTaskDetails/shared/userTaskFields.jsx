import React from 'react';

import SentryTypes from 'app/sentryTypes';
import withOrganization from 'app/utils/withOrganization';

import {fetchGroupEventAndMarkSeen} from './utils';

class UserTaskFields extends React.Component {
  static propTypes = {
    group: SentryTypes.Group.isRequired,
    project: SentryTypes.Project.isRequired,
    organization: SentryTypes.Organization.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      error: false,
      event: null,
      eventNavLinks: '',
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.params.eventId !== this.props.params.eventId) {
      this.fetchData();
    }
  }

  fetchData = () => {
    const {group, project, organization, params} = this.props;
    const eventId = params.eventId || 'latest';
    const groupId = group.id;
    const orgSlug = organization.slug;
    const projSlug = project.slug;

    this.setState({
      loading: true,
      error: false,
    });

    fetchGroupEventAndMarkSeen(orgSlug, projSlug, groupId, eventId)
      .then(data => {
        this.setState({
          event: data,
          error: false,
          loading: false,
        });
      })
      .catch(() => {
        this.setState({
          error: true,
          loading: false,
        });
      });
  };
  render() {
    return <div />;
  }
}

export default withOrganization(UserTaskFields);
