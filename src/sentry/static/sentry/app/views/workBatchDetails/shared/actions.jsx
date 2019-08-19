import {browserHistory} from 'react-router';
import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';

import {analytics} from 'app/utils/analytics';
import {openModal} from 'app/actionCreators/modal';
import {t} from 'app/locale';
import ApiMixin from 'app/mixins/apiMixin';
import Button from 'app/components/button';
import Feature from 'app/components/acl/feature';
import FeatureDisabled from 'app/components/acl/featureDisabled';
import OrganizationState from 'app/mixins/organizationState';
import GuideAnchor from 'app/components/assistant/guideAnchor';
import IndicatorStore from 'app/stores/indicatorStore';
import LinkWithConfirmation from 'app/components/linkWithConfirmation';
import ResolveActions from 'app/components/actions/resolve';
import SentryTypes from 'app/sentryTypes';
import space from 'app/styles/space';

class DeleteActions extends React.Component {
  static propTypes = {
    organization: SentryTypes.Organization.isRequired,
    onDelete: PropTypes.func.isRequired,
    onDiscard: PropTypes.func.isRequired,
  };

  renderDiscardDisabled = ({children, ...props}) =>
    children({
      ...props,
      renderDisabled: ({features}) => (
        <FeatureDisabled alert featureName="Discard and Delete" features={features} />
      ),
    });

  renderDiscardModal = ({Body, closeModal}) => (
    <Feature
      features={['projects:discard-groups']}
      organization={this.props.organization}
      renderDisabled={this.renderDiscardDisabled}
    >
      {({hasFeature, renderDisabled, ...props}) => (
        <React.Fragment>
          <Body>
            {!hasFeature && renderDisabled({hasFeature, ...props})}
            {t(
              'Discarding this event will result in the deletion ' +
                'of most data associated with this issue and future ' +
                'events being discarded before reaching your stream. ' +
                'Are you sure you wish to continue?'
            )}
          </Body>
          <div className="modal-footer">
            <Button onClick={closeModal}>{t('Cancel')}</Button>
            <Button
              style={{marginLeft: space(1)}}
              priority="primary"
              onClick={this.props.onDiscard}
              disabled={!hasFeature}
            >
              {t('Discard Future Events')}
            </Button>
          </div>
        </React.Fragment>
      )}
    </Feature>
  );

  openDiscardModal = () => {
    openModal(this.renderDiscardModal);
    analytics('feature.discard_group.modal_opened', {
      org_id: parseInt(this.props.organization.id, 10),
    });
  };

  render() {
    return (
      <div className="btn-group">
        <LinkWithConfirmation
          className="group-remove btn btn-default btn-sm"
          title={t('Delete')}
          message={t(
            'Deleting this issue is permanent. Are you sure you wish to continue?'
          )}
          onConfirm={this.props.onDelete}
        >
          <span className="icon-trash" />
          <GuideAnchor type="text" target="ignore_delete_discard" />
        </LinkWithConfirmation>
      </div>
    );
  }
}

const WorkBatchActionsComponent = createReactClass({
  displayName: 'WorkBatchActions',

  propTypes: {
    group: SentryTypes.Group.isRequired,
  },

  mixins: [ApiMixin, OrganizationState],

  getInitialState() {
    return {ignoreModal: null, shareBusy: false};
  },

  getShareUrl(shareId, absolute) {
    if (!shareId) {
      return '';
    }

    const path = `/share/issue/${shareId}/`;
    if (!absolute) {
      return path;
    }
    const {host, protocol} = window.location;
    return `${protocol}//${host}${path}`;
  },

  onDelete() {
    const {group} = this.props;
    const org = this.getOrganization();
    const loadingIndicator = IndicatorStore.add(t('Delete event..'));

    this.api.bulkDelete(
      {
        orgId: org.slug,
        itemIds: [group.id],
      },
      {
        complete: () => {
          IndicatorStore.remove(loadingIndicator);

          browserHistory.push(`/${org.slug}/`);
        },
      }
    );
  },

  onUpdate(data) {
    const {group} = this.props;
    const org = this.getOrganization();
    const loadingIndicator = IndicatorStore.add(t('Saving changes..'));

    this.api.bulkUpdate(
      {
        orgId: org.slug,
        itemIds: [group.id],
        data,
      },
      {
        complete: () => {
          IndicatorStore.remove(loadingIndicator);
        },
      }
    );
  },

  onShare(shared) {
    const {group} = this.props;
    const org = this.getOrganization();
    this.setState({shareBusy: true});

    // not sure why this is a bulkUpdate
    this.api.bulkUpdate(
      {
        orgId: org.slug,
        itemIds: [group.id],
        data: {
          isPublic: shared,
        },
      },
      {
        error: () => {
          IndicatorStore.add(t('Error sharing'), 'error');
        },
        complete: () => {
          this.setState({shareBusy: false});
        },
      }
    );
  },

  onToggleShare() {
    this.onShare(!this.props.group.isPublic);
  },

  onToggleBookmark() {
    this.onUpdate({isBookmarked: !this.props.group.isBookmarked});
  },

  onDiscard() {
    throw new Error('Not implemented');
  },

  render() {
    const {group} = this.props;
    const org = this.getOrganization();

    let bookmarkClassName = 'group-bookmark btn btn-default btn-sm';
    if (group.isBookmarked) {
      bookmarkClassName += ' active';
    }

    const isResolved = group.status === 'resolved';

    return (
      <div className="group-actions">
        <ResolveActions
          onUpdate={this.onUpdate}
          orgId={org.slug}
          isResolved={isResolved}
          isAutoResolved={isResolved && group.statusDetails.autoResolved}
        />

        <div className="btn-group">
          <a
            className={bookmarkClassName}
            title={t('Bookmark')}
            onClick={this.onToggleBookmark}
          >
            <span className="icon-star-solid" />
          </a>
        </div>
        <DeleteActions
          organization={org}
          onDelete={this.onDelete}
          onDiscard={this.onDiscard}
        />
      </div>
    );
  },
});

export default WorkBatchActionsComponent;
