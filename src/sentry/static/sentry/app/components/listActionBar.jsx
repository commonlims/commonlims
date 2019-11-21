import {Flex, Box} from 'grid-emotion';
import {capitalize} from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import styled from 'react-emotion';

import {t, tn} from 'app/locale';
import ActionLink from 'app/components/actions/actionLink';
import SelectedGroupStore from 'app/stores/selectedGroupStore';
// TODO: Substances specific actions:
import UploadSubstancesButton from 'app/views/substances/uploadSubstancesButton';
import AssignToWorkflowButton from 'app/components/substances/assignToWorkflow';

// TODO: In Sentry they had a way to apply an action to everything in a search, even outside
// the current page. Consider doing the same.
const getConfirm = (numIssues, allInQuerySelected, query, queryCount) => {
  return function(action, canBeUndone, append = '') {
    const question = tn(
      `Are you sure you want to ${action} this %s issue${append}?`,
      `Are you sure you want to ${action} these %s issues${append}?`,
      numIssues
    );

    // TODO: The text referring to the current search query needs to change if the user
    // can apply things to every page.
    return (
      <div>
        <p style={{marginBottom: '20px'}}>
          <strong>{question}</strong>
        </p>
        <div>
          <p>{t('This will apply to the current search query') + ':'}</p>
          <pre>{query}</pre>
        </div>
        {!canBeUndone && <p>{t('This action cannot be undone.')}</p>}
      </div>
    );
  };
};

const getLabel = (numIssues, allInQuerySelected) => {
  return function(action, append = '') {
    const capitalized = capitalize(action);
    const text = allInQuerySelected
      ? t(`Bulk ${action} issues`)
      : tn(
          `${capitalized} %s selected issue`,
          `${capitalized} %s selected issues`,
          numIssues
        );

    return text + append;
  };
};

const ListActionBar = createReactClass({
  displayName: 'ListActionBar',

  propTypes: {
    groupIds: PropTypes.instanceOf(Array),
    query: PropTypes.string.isRequired,
    queryCount: PropTypes.number,
    canAssignToWorkflow: PropTypes.bool.isRequired,
  },

  getDefaultProps() {
    return {
      projectId: '',
      hasReleases: false,
      latestRelease: null,
    };
  },

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
      const itemIdSet = SelectedGroupStore.getSelectedIds();
      selectedIds = this.props.groupIds.filter(itemId => itemIdSet.has(itemId));
    }

    callback(selectedIds);

    this.deselectAll();
  },

  deselectAll() {
    SelectedGroupStore.deselectAll();
    this.setState({allInQuerySelected: false});
  },

  shouldConfirm(action) {
    return true; // TODO: only if required
  },

  render() {
    const {queryCount, query} = this.props;
    const issues = this.state.selectedIds;
    const numIssues = issues.size;
    const {allInQuerySelected, anySelected} = this.state;

    // TODO: This is not hooked up at the moment:
    const confirm = getConfirm(numIssues, allInQuerySelected, query, queryCount);
    const label = getLabel(numIssues, allInQuerySelected);

    const showBookmark = false;

    return (
      <div>
        <StyledFlex py={1}>
          <ActionSet w={[8 / 12, 8 / 12, 6 / 12]} mx={1} flex="1">
            <div className="btn-group">
              <UploadSubstancesButton className="btn btn-sm btn-default" disabled={false}>
                {t('Import samples')}
              </UploadSubstancesButton>
            </div>

            <div className="btn-group">
              <AssignToWorkflowButton
                className="btn btn-sm btn-default"
                disabled={!this.props.canAssignToWorkflow}
              >
                {t('Assign to workflow')}
              </AssignToWorkflowButton>
            </div>

            {showBookmark && (
              <div className="btn-group hidden-xs">
                <ActionLink
                  className="btn btn-default btn-sm action-bookmark hidden-sm hidden-xs"
                  onAction={undefined}
                  shouldConfirm={this.shouldConfirm('bookmark')}
                  message={confirm('bookmark', false)}
                  confirmLabel={label('bookmark')}
                  title={t('Add to Bookmarks')}
                  disabled={!anySelected}
                >
                  <i aria-hidden="true" className="icon-star-solid" />
                </ActionLink>
              </div>
            )}
          </ActionSet>
        </StyledFlex>
      </div>
    );
  },
});

const StyledFlex = styled(Flex)`
  align-items: center;
  background: ${p => p.theme.offWhite};
  border-radius: ${p => p.theme.borderRadius} ${p => p.theme.borderRadius} 0 0;
  margin-bottom: -1px;
`;

const ActionSet = styled(Box)`
  display: flex;

  .btn-group {
    margin-right: 6px;
  }
`;

export default ListActionBar;
