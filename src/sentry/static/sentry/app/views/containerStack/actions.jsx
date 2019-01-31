import {Flex, Box} from 'grid-emotion';
import PropTypes from 'prop-types';
import React from 'react';
import Reflux from 'reflux';
import createReactClass from 'create-react-class';
import styled from 'react-emotion';

import {t} from 'app/locale';
import ApiMixin from 'app/mixins/apiMixin';
import IndicatorStore from 'app/stores/indicatorStore';
import SelectedSampleStore from 'app/stores/selectedSampleStore';

const ContainerStackActions = createReactClass({
  displayName: 'ContainerStackActions',

  propTypes() {
    return {
      canAdd: PropTypes.boolean,
      // TODO: The container should be reused between all components
      container: PropTypes.shape({
        name: PropTypes.string,
      }),
    };
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

  onRealtimeChange(evt) {},

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
    // TODO(withrocks): Base the AssignToWorkflowButton on the Merge button so it gets the same UI
    return (
      <Sticky>
        <StyledFlex py={1}>
          <CurrentContainerName>{this.props.container.name}</CurrentContainerName>
          <div className="align-right">
            <ActionSet w={[8 / 12, 8 / 12, 6 / 12]} mx={1} flex="1">
              <a
                title="Add"
                className="btn btn-sm btn-default"
                disabled={!this.props.canAdd}
                onClick={this.addContainer}
              >
                {t('Add')}
              </a>
              <a
                title="Remove"
                className="btn btn-sm btn-default"
                disabled={!this.props.canAdd}
                onClick={this.removeContainer}
              >
                {t('Remove')}
              </a>
            </ActionSet>
          </div>
        </StyledFlex>
      </Sticky>
    );
  },
});

const CurrentContainerName = styled.b`
  margin-left: 6px;
`;

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

const ActionSet = styled(Box)`
  display: flex;

  .btn-group {
    margin-right: 6px;
  }
`;

export default ContainerStackActions;
