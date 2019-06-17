import {Flex} from 'grid-emotion';
import PropTypes from 'prop-types';
import React from 'react';
import Reflux from 'reflux';
import createReactClass from 'create-react-class';
import styled from 'react-emotion';

import {t} from 'app/locale';
import ApiMixin from 'app/mixins/apiMixin';
import IndicatorStore from 'app/stores/indicatorStore';
import SelectedProcessStore from 'app/stores/selectedProcessStore';
import SentryTypes from 'app/sentryTypes';

const ExtraDescription = ({all, query, queryCount}) => {
  if (!all) return null;

  if (query) {
    return (
      <div>
        <p>{t('This will apply to the current search query') + ':'}</p>
        <pre>{query}</pre>
      </div>
    );
  }
  return (
    <p className="error">
      <strong>text</strong>
    </p>
  );
};

ExtraDescription.propTypes = {
  all: PropTypes.bool,
  query: PropTypes.string,
  queryCount: PropTypes.number,
};

const ProcessesActions = createReactClass({
  displayName: 'ProcessesActions',

  propTypes: {
    orgId: PropTypes.string.isRequired,
    groupIds: PropTypes.instanceOf(Array).isRequired,
    onRealtimeChange: PropTypes.func.isRequired,
    realtimeActive: PropTypes.bool.isRequired,
    query: PropTypes.string.isRequired,
    environment: SentryTypes.Environment,
    projectId: PropTypes.string,
  },

  mixins: [ApiMixin, Reflux.listenTo(SelectedProcessStore, 'onSelectedProcessChange')],

  getDefaultProps() {
    return {hasReleases: false, latestRelease: null};
  },

  getInitialState() {
    return {
      datePickerActive: false,
      anySelected: false,
      identicalFieldsSelected: false,
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

  actionSelectedProcesss(callback) {
    let selectedIds;

    if (this.state.allInQuerySelected) {
      selectedIds = undefined; // undefined means "all"
    } else {
      let itemIdSet = SelectedProcessStore.getSelectedIds();
      selectedIds = this.props.groupIds.filter(itemId => itemIdSet.has(itemId));
    }

    callback(selectedIds);

    this.deselectAll();
  },

  deselectAll() {
    SelectedProcessStore.deselectAll();
    this.setState({allInQuerySelected: false});
  },

  onUpdate(data) {
    this.actionSelectedProcesss(itemIds => {
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

    this.actionSelectedProcesss(itemIds => {
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

    this.actionSelectedProcesss(itemIds => {
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

  onSelectedProcessChange() {
    this.setState({
      pageSelected: SelectedProcessStore.allSelected(),
      multiSelected: SelectedProcessStore.multiSelected(),
      identicalFieldsSelected: SelectedProcessStore.identicalFieldsSelected(),
      anySelected: SelectedProcessStore.anySelected(),
      allInQuerySelected: false, // any change resets
      selectedIds: SelectedProcessStore.getSelectedIds(),
    });
  },

  onSelectAll() {
    SelectedProcessStore.toggleSelectAll();
  },

  onRealtimeChange(evt) {
    this.props.onRealtimeChange(!this.props.realtimeActive);
  },

  shouldConfirm(action) {
    let selectedItems = SelectedProcessStore.getSelectedIds();
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
    return (
      <Sticky>
        <StyledFlex py={1}>
          {/*<ActionsCheckbox pl={2}>
            <Checkbox onChange={this.onSelectAll} checked={pageSelected} />
          </ActionsCheckbox>

          <ActionSet w={[8 / 12, 8 / 12, 6 / 12]} mx={1} flex="1">
            <SetProcessVariables
                  className="btn btn-sm btn-default"
                  disabled={!identicalFieldsSelected}
                  {...this.props}>
                  {t('Set variables')}
            </SetProcessVariables>
          </ActionSet>*/}
          {/*  TODO
          <Box w={[40, 60, 80, 80]} mx={2} className="align-right">
            <ToolbarHeader>{t('Process')}</ToolbarHeader>
          </Box>
          <Box w={[40, 60, 80, 80]} mx={2} className="align-right">
            <ToolbarHeader>{t('Waiting')}</ToolbarHeader>
          </Box>*/}
        </StyledFlex>
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

export default ProcessesActions;
