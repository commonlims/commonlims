import React from 'react';
import createReactClass from 'create-react-class';
import ApiMixin from 'app/mixins/apiMixin';
import SampleEventEntries from 'app/components/events/sampleEventEntries';
import MutedBox from 'app/components/mutedBox';
import GroupEventDetailsLoadingError from 'app/components/errors/groupEventDetailsLoadingError';
import LoadingIndicator from 'app/components/loadingIndicator';
import ResolutionBox from 'app/components/resolutionBox';
import withEnvironmentInQueryString from 'app/utils/withEnvironmentInQueryString';

const SampleSummary = createReactClass({
  displayName: 'SampleSummary',

  mixins: [ApiMixin],

  getInitialState() {
    return {
      loading: true,
      error: false,
      event: null,
      eventNavLinks: '',
    };
  },

  componentWillMount() {
    this.fetchData();
  },

  componentDidUpdate(prevProps) {
    if (prevProps.params.eventId !== this.props.params.eventId) {
      this.fetchData();
    }
  },

  fetchData() {
    const eventId = this.props.params.eventId || 'latest';

    const url =
      eventId === 'latest' || eventId === 'oldest'
        ? '/issues/' + this.getGroup().id + '/events/' + eventId + '/'
        : '/events/' + eventId + '/';

    this.setState({
      loading: true,
      error: false,
    });

    this.api.request(url, {
      success: (data, _, jqXHR) => {
        this.setState({
          event: data,
          error: false,
          loading: false,
        });

        this.api.bulkUpdate({
          orgId: this.getOrganization().slug,
          projectId: this.getProject().slug,
          itemIds: [this.getGroup().id],
          failSilently: true,
          data: {hasSeen: true},
        });
      },
      error: () => {
        this.setState({
          error: true,
          loading: false,
        });
      },
    });
  },

  render() {
    const group = this.getGroup();
    const evt = this.state.event;
    const params = this.props.params;

    return (
      <div>
        <div className="event-details-container">
          <div className="primary">
            {group.status != 'unresolved' && (
              <div className="issue-status">
                {group.status === 'ignored' && (
                  <MutedBox statusDetails={group.statusDetails} />
                )}
                {group.status === 'resolved' && (
                  <ResolutionBox statusDetails={group.statusDetails} params={params} />
                )}
              </div>
            )}
            {this.state.loading ? (
              <LoadingIndicator />
            ) : this.state.error ? (
              <GroupEventDetailsLoadingError onRetry={this.fetchData} />
            ) : (
              <SampleEventEntries
                group={group}
                event={evt}
                orgId={params.orgId}
                project={this.getProject()}
              />
            )}
          </div>
        </div>
      </div>
    );
  },
});

export default withEnvironmentInQueryString(SampleSummary);
