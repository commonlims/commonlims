import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ApiMixin from 'app/mixins/apiMixin';
import SampleActions from 'app/views/sampleDetails/actions';
import SampleSeenBy from 'app/views/sampleDetails/seenBy';
import IndicatorStore from 'app/stores/indicatorStore';
import ListLink from 'app/components/listLink';
import ShortId from 'app/components/shortId';
import SampleTitle from 'app/components/sampleTitle';
import GuideAnchor from 'app/components/assistant/guideAnchor';
import OrganizationState from 'app/mixins/organizationState';
import Tooltip from 'app/components/tooltip';
import {t} from 'app/locale';

const SampleDetailsHeader = createReactClass({
  displayName: 'SampleDetailsHeader',

  propTypes: {
    group: PropTypes.object.isRequired,
  },

  contextTypes: {
    location: PropTypes.object,
  },

  mixins: [ApiMixin, OrganizationState],

  onToggleMute() {
    let group = this.props.group;
    let project = this.getProject();
    let org = this.getOrganization();
    let loadingIndicator = IndicatorStore.add(t('Saving changes..'));

    this.api.bulkUpdate(
      {
        orgId: org.slug,
        projectId: project.slug,
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
    let group = this.props.group;

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

    let projectId = '5'; // TODO: Not a project-specific view
    let groupId = group.id,
      //projectId = this.getProject().slug,
      orgId = this.getOrganization().slug;
    let message = this.getMessage();

    //let hasSimilarView = projectFeatures.has('similarity-view');
    let sample = {
      title: 'hund-123',
      container: 'hund-container-1',
      position: 'A1',
    };

    return (
      <div className={className}>
        <div className="row">
          <div className="col-sm-7">
            <h3>
              <SampleTitle data={sample} />
            </h3>
            <div className="event-message">
              {message && <span className="message">{sample.container}</span>}
            </div>
          </div>
          <div className="col-sm-5 stats">
            <div className="flex flex-justify-right">
              {group.shortId && (
                <div className="short-id-box count align-right">
                  <h6 className="nav-header">
                    <GuideAnchor target="sample_id" type="text" />
                    <Tooltip
                      title={t('The internal ID of the sample. Will never change.')}
                    >
                      <a
                        className="help-link"
                        href="https://commomlims.github.io/doing-things-the-right-way/#resolving-issues-via-commits"
                      >
                        {t('Sample ID')}
                      </a>
                    </Tooltip>
                  </h6>
                  <ShortId shortId={'5'} />
                </div>
              )}
            </div>
          </div>
        </div>
        <SampleSeenBy />
        <SampleActions />
        <ul className="nav nav-tabs">
          <ListLink
            to={`/${orgId}/${projectId}/issues/${groupId}/`}
            isActive={() => {
              let rootGroupPath = `/${orgId}/${projectId}/issues/${groupId}/`;
              let pathname = this.context.location.pathname;

              // Because react-router 1.0 removes router.isActive(route)
              return pathname === rootGroupPath || /events\/\w+\/$/.test(pathname);
            }}
          >
            {t('Details')}
          </ListLink>
          <ListLink to={`/${orgId}/internal/samples/5/processes?active=true`}>
            {t('Processes')} <span className="badge animated">{2}</span>
          </ListLink>
          <ListLink to={`/${orgId}/internal/samples/5/history`}>
            {t('History')} <span className="badge animated">{5}</span>
          </ListLink>
        </ul>
      </div>
    );
  },
});

export default SampleDetailsHeader;
