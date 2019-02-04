import {browserHistory} from 'react-router';
import React from 'react';

import createReactClass from 'create-react-class';

import {t} from 'app/locale';
import ApiMixin from 'app/mixins/apiMixin';
import DropdownLink from 'app/components/dropdownLink';
import GroupActions from 'app/actions/groupActions';
import IndicatorStore from 'app/stores/indicatorStore';
import MenuItem from 'app/components/menuItem';

const SampleDetailsActions = createReactClass({
  displayName: 'SampleDetailsActions',

  mixins: [ApiMixin],

  getInitialState() {
    return {ignoreModal: null, shareBusy: false};
  },

  getShareUrl(shareId, absolute) {
    if (!shareId) return '';

    let path = `/share/issue/${shareId}/`;
    if (!absolute) {
      return path;
    }
    let {host, protocol} = window.location;
    return `${protocol}//${host}${path}`;
  },

  onUpdate(data) {
    let group = this.getGroup();
    let org = this.getOrganization();
    let loadingIndicator = IndicatorStore.add(t('Saving changes..'));

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
    let group = this.getGroup();
    let org = this.getOrganization();
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
    let group = this.getGroup();
    this.onShare(!group.isPublic);
  },

  onToggleBookmark() {
    this.onUpdate({isBookmarked: !this.getGroup().isBookmarked});
  },

  onDiscard() {
    let group = this.getGroup();
    let org = this.getOrganization();
    let id = this.api.uniqueId();
    let loadingIndicator = IndicatorStore.add(t('Discarding event..'));

    GroupActions.discard(id, group.id);

    this.api.request(`/issues/${group.id}/`, {
      method: 'PUT',
      data: {discard: true},
      success: response => {
        GroupActions.discardSuccess(id, group.id, response);
        browserHistory.push(`/${org.slug}/${'NOTAVAIL.slug'}/`);
      },
      error: error => {
        GroupActions.discardError(id, group.id, error);
      },
      complete: () => {
        IndicatorStore.remove(loadingIndicator);
      },
    });
  },

  render() {
    let group = this.getGroup();
    let orgFeatures = new Set(this.getOrganization().features);

    let bookmarkClassName = 'group-bookmark btn btn-default btn-sm';
    if (group.isBookmarked) {
      bookmarkClassName += ' active';
    }

    return (
      <div className="group-actions">
        {/*<IgnoreActions isIgnored={isIgnored} onUpdate={this.onUpdate} />*/}

        <div className="btn-group">
          <a
            className={bookmarkClassName}
            title={t('Bookmark')}
            onClick={this.onToggleBookmark}
          >
            <span className="icon-star-solid" />
          </a>
        </div>

        {group.pluginActions.length > 1 && !orgFeatures.has('new-issue-ui') ? (
          <div className="btn-group more">
            <DropdownLink className="btn btn-default btn-sm" title={t('More')}>
              {group.pluginActions.map((action, actionIdx) => {
                return (
                  <MenuItem key={actionIdx} href={action[1]}>
                    {action[0]}
                  </MenuItem>
                );
              })}
            </DropdownLink>
          </div>
        ) : (
          group.pluginActions.length !== 0 &&
          !orgFeatures.has('new-issue-ui') &&
          group.pluginActions.map((action, actionIdx) => {
            return (
              <div className="btn-group" key={actionIdx}>
                <a className="btn btn-default btn-sm" href={action[1]}>
                  {action[0]}
                </a>
              </div>
            );
          })
        )}
      </div>
    );
  },
});

export default SampleDetailsActions;
