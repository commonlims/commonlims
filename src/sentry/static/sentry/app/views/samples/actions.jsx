import {Flex, Box} from 'grid-emotion';
import PropTypes from 'prop-types';
import React from 'react';
import Reflux from 'reflux';
import createReactClass from 'create-react-class';
import styled from 'react-emotion';

import {t, tct, tn} from 'app/locale';
import ApiMixin from 'app/mixins/apiMixin';
import Checkbox from 'app/components/checkbox';
import IndicatorStore from 'app/stores/indicatorStore';
import SelectedSampleStore from 'app/stores/selectedSampleStore';
import SentryTypes from 'app/sentryTypes';
import ToolbarHeader from 'app/components/toolbarHeader';
import AssignToWorkflowButton from 'app/views/samples/assignToWorkflow';
import WorkOnButton from 'app/views/samples/workOnButton';
import UploadSamplesButton from 'app/views/samples/uploadSamples';

const BULK_LIMIT = 1000;
const BULK_LIMIT_STR = BULK_LIMIT.toLocaleString();

const SamplesActions = createReactClass({
  displayName: 'SamplesActions',

  propTypes: {
    allResultsVisible: PropTypes.bool,
    orgId: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    groupIds: PropTypes.instanceOf(Array).isRequired,
    onRealtimeChange: PropTypes.func.isRequired,
    realtimeActive: PropTypes.bool.isRequired,
    statsPeriod: PropTypes.string.isRequired,
    query: PropTypes.string.isRequired,
    environment: SentryTypes.Environment,
    queryCount: PropTypes.number,
  },

  mixins: [ApiMixin, Reflux.listenTo(SelectedSampleStore, 'onSelectedGroupChange')],

  getInitialState() {
    return {
      datePickerActive: false,
      anySelected: false,
      multiSelected: false, // more than one selected
      pageSelected: false, // all on current page selected (e.g. 25)
      allInQuerySelected: false, // all in current search query selected (e.g. 1000+)
      selectedIds: new Set(),
    };
  },

  selectAll() {
    this.setState({
      allInQuerySelected: true,
    });
  },

  actionSelectedGroups(callback) {
    let selectedIds;

    if (this.state.allInQuerySelected) {
      selectedIds = undefined; // undefined means "all"
    } else {
      let itemIdSet = SelectedSampleStore.getSelectedIds();
      selectedIds = this.props.groupIds.filter(itemId => itemIdSet.has(itemId));
    }

    callback(selectedIds);

    this.deselectAll();
  },

  deselectAll() {
    SelectedSampleStore.deselectAll();
    this.setState({allInQuerySelected: false});
  },

  onUpdate(data) {
    this.actionSelectedGroups(itemIds => {
      let loadingIndicator = IndicatorStore.add(t('Saving changes..'));

      this.api.bulkUpdate(
        {
          orgId: this.props.orgId,
          projectId: this.props.projectId,
          itemIds,
          data,
          query: this.props.query,
          environment: this.props.environment && this.props.environment.name,
        },
        {
          complete: () => {
            IndicatorStore.remove(loadingIndicator);
          },
        }
      );
    });
  },

  onDelete(event) {
    let loadingIndicator = IndicatorStore.add(t('Removing events..'));

    this.actionSelectedGroups(itemIds => {
      this.api.bulkDelete(
        {
          orgId: this.props.orgId,
          projectId: this.props.projectId,
          itemIds,
          query: this.props.query,
          environment: this.props.environment && this.props.environment.name,
        },
        {
          complete: () => {
            IndicatorStore.remove(loadingIndicator);
          },
        }
      );
    });
  },

  onMerge(event) {
    let loadingIndicator = IndicatorStore.add(t('Merging events..'));

    this.actionSelectedGroups(itemIds => {
      this.api.merge(
        {
          orgId: this.props.orgId,
          projectId: this.props.projectId,
          itemIds,
          query: this.props.query,
          environment: this.props.environment && this.props.environment.name,
        },
        {
          complete: () => {
            IndicatorStore.remove(loadingIndicator);
          },
        }
      );
    });
  },

  onSelectedGroupChange() {
    this.setState({
      pageSelected: SelectedSampleStore.allSelected(),
      multiSelected: SelectedSampleStore.multiSelected(),
      anySelected: SelectedSampleStore.anySelected(),
      allInQuerySelected: false, // any change resets
      selectedIds: SelectedSampleStore.getSelectedIds(),
    });
  },

  onSelectAll() {
    SelectedSampleStore.toggleSelectAll();
  },

  onRealtimeChange(evt) {
    this.props.onRealtimeChange(!this.props.realtimeActive);
  },

  shouldConfirm(action) {
    let selectedItems = SelectedSampleStore.getSelectedIds();
    switch (action) {
      case 'resolve':
      case 'unresolve':
      case 'ignore':
      case 'unbookmark':
        return this.state.pageSelected && selectedItems.size > 1;
      case 'bookmark':
        return selectedItems.size > 1;
      case 'merge':
      case 'delete':
      default:
        return true; // By default, should confirm ...
    }
  },

  render() {
    let {allResultsVisible, queryCount} = this.props;
    let issues = this.state.selectedIds;
    let numIssues = issues.size;
    let {allInQuerySelected, anySelected, pageSelected} = this.state;

    // TODO(withrocks): Base the AssignToWorkflowButton on the Merge button so it gets the same UI
    return (
      <Sticky>
        <StyledFlex py={1}>
          <ActionsCheckbox pl={2}>
            <Checkbox onChange={this.onSelectAll} checked={pageSelected} />
          </ActionsCheckbox>

          <ActionSet w={[8 / 12, 8 / 12, 6 / 12]} mx={1} flex="1">
            <WorkOnButton
              className="btn btn-sm btn-default"
              disabled={!anySelected}
              {...this.props}
            >
              {t('Start work')}
            </WorkOnButton>
            <AssignToWorkflowButton
              className="btn btn-sm btn-default"
              disabled={!anySelected}
              {...this.props}
            >
              {t('Assign to workflow')}
            </AssignToWorkflowButton>
            <UploadSamplesButton className="btn btn-sm btn-default" disabled={false}>
              {t('Import samples')}
            </UploadSamplesButton>
          </ActionSet>
        </StyledFlex>

        {!allResultsVisible &&
          pageSelected && (
            <div className="row stream-select-all-notice">
              <div className="col-md-12">
                {allInQuerySelected ? (
                  <strong>
                    {queryCount >= BULK_LIMIT
                      ? tct(
                          'Selected up to the first [count] issues that match this search query.',
                          {
                            count: BULK_LIMIT_STR,
                          }
                        )
                      : tct('Selected all [count] issues that match this search query.', {
                          count: queryCount,
                        })}
                  </strong>
                ) : (
                  <span>
                    {tn(
                      '%d issue on this page selected.',
                      '%d issues on this page selected.',
                      numIssues
                    )}
                    <a onClick={this.selectAll}>
                      {queryCount >= BULK_LIMIT
                        ? tct(
                            'Select the first [count] issues that match this search query.',
                            {
                              count: BULK_LIMIT_STR,
                            }
                          )
                        : tct('Select all [count] issues that match this search query.', {
                            count: queryCount,
                          })}
                    </a>
                  </span>
                )}
              </div>
            </div>
          )}
      </Sticky>
    );
  },
});

const Sticky = styled.div`
  position: sticky;
  z-index: ${p => p.theme.zIndex.header};
  top: -1px;
`;

const StyledFlex = styled(Flex)`
  align-items: center;
  background: ${p => p.theme.offWhite};
  border-bottom: 1px solid ${p => p.theme.borderDark};
  border-radius: ${p => p.theme.borderRadius} ${p => p.theme.borderRadius} 0 0;
  margin-bottom: -1px;
`;

const ActionsCheckbox = styled(Box)`
  & input[type='checkbox'] {
    margin: 0;
    display: block;
  }
`;

const ActionSet = styled(Box)`
  display: flex;

  .btn-group {
    margin-right: 6px;
  }
`;

export default SamplesActions;
