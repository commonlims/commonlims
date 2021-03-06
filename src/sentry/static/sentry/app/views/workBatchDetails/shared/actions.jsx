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
import withOrganization from 'app/utils/withOrganization';
import {connect} from 'react-redux';
import LoadingIndicator from 'app/components/loadingIndicator';
import {eventActions} from 'app/redux/actions/event';
import {workBatchDetailsActions} from 'app/redux/actions/workBatchDetailsEntry';
import merge from 'lodash/merge';

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

function WorkBatchActionsWrapper(props) {
  // WorkBatchActionsComponent is here wrapped within a function component,
  // in order to getUpdatedWorkbatch into test
  const extendedProps = {
    ...props,
    getUpdatedWorkBatch,
  };
  return <WorkBatchActionsComponent {...extendedProps} />;
}

const WorkBatchActionsComponent = createReactClass({
  displayName: 'WorkBatchActions',

  propTypes: {
    group: PropTypes.shape({
      id: PropTypes.number.isRequired,
    }),
    sendButtonClickedEvent: PropTypes.func.isRequired,
    getUpdatedWorkBatch: PropTypes.func.isRequired,
    workDefinition: PropTypes.object.isRequired,
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
    let {workDefinition} = this.props;
    if (!workDefinition) {
      return <LoadingIndicator />;
    }
    let {buttons: buttonDefinitions} = workDefinition;

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
        <p></p>
        <div>
          {buttonDefinitions.map((entry) => {
            const buttonClick = () => {
              this.sendButtonClickedEvent(entry.event, group.id);
            };
            return (
              <button
                className="btn btn-sm btn-default"
                key={'button-' + entry.event}
                onClick={buttonClick}
                name={entry.event}
              >
                {entry.caption}
              </button>
            );
          })}
        </div>
      </div>
    );
  },

  sendButtonClickedEvent(event, workBatchId) {
    const buttonEvent = {
      event,
      work_batch_id: workBatchId,
    };
    let {currentFieldValues} = this.props;
    let updatedWorkbatch = this.props.getUpdatedWorkBatch(
      this.props.workBatch,
      currentFieldValues
    );
    this.props.updateWorkBatchDetails(this.props.organization, updatedWorkbatch);
    this.props.sendButtonClickedEvent(this.props.organization, buttonEvent);
  },
});

export function getUpdatedWorkBatch(fetched_workbatch, currentFieldValues) {
  let properties = Object.keys(currentFieldValues);
  let updatedProperties = properties.reduce((previous, current) => {
    let entry = {
      name: current,
      value: currentFieldValues[current] ? currentFieldValues[current] : null,
    };
    return {
      ...previous,
      [current]: entry,
    };
  }, {});
  let mergedProperties = merge({}, fetched_workbatch.properties, updatedProperties);
  return {
    ...fetched_workbatch,
    properties: mergedProperties,
  };
}

const mapStateToProps = (state) => ({
  workBatch: state.workBatchDetailsEntry.resource,
  currentFieldValues: state.workBatchDetailsEntry.localChanges,
});

const mapDispatchToProps = (dispatch) => ({
  sendButtonClickedEvent: (org, buttonEvent) => {
    return dispatch(eventActions.create(org, buttonEvent));
  },
  updateWorkBatchDetails: (org, workBatch) => {
    return dispatch(workBatchDetailsActions.update(org, workBatch));
  },
});

export default withOrganization(
  connect(mapStateToProps, mapDispatchToProps)(WorkBatchActionsWrapper)
);
