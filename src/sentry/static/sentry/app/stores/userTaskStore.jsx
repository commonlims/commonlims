import _ from 'lodash';
import Reflux from 'reflux';

import GroupActions from 'app/actions/groupActions';
import IndicatorStore from 'app/stores/indicatorStore';
import PendingChangeQueue from 'app/utils/pendingChangeQueue';
import { t } from 'app/locale';

function showAlert(msg, type) {
  IndicatorStore.add(msg, type, {
    duration: 4000,
  });
}

const UserTaskStore = Reflux.createStore({
  listenables: [GroupActions],

  init() {
    this.reset();
  },

  setSubtaskManualOverride(subtaskId, value) {
    // TODO: using view
    for (let current of this.userTask.subtasks) {
      if (current.view === subtaskId) {
        current.manualOverride = value;
        let status = value ? "done" : "not done";

        // TODO:
        let activity = {
          'id': '1',
          'user': {
            "id": "1",
            "name": "steinar.sturlaugsson@medsci.uu.se",
            "avatarUrl": "https://secure.gravatar.com/avatar/c454a1cd6f9395d199b0aa97aefd9e67?s=32&d=mm",
            "avatar": {
              "avatarUuid": null,
              "avatarType": "letter_avatar"
            },
            "hasPasswordAuth": true,
            "permissions": [],
            "email": "steinar.sturlaugsson@medsci.uu.se"
          },
          'type': 'set_manual_override',
          'data': {
            'status': status,
            'subtask': current.description, 'text': `Manually flagged subtask '${current.description}' as OK`
          },
          "dateCreated": "2019-22-06T14:33:16.353Z",
        };
        this.addActivity(activity);

        this.trigger();
        break;
      }
    }
  },

  setField(field, value) {
    for (let current of this.userTask.fields) {
      console.log("current", current);
      if (current.name === field.name) {
        console.log("found it", current.value, value);
        current.value = value;
        break;
      }
    }

    // Validate that all required fields have been marked TODO wireframing here
    let allRequiredFilled = true;
    for (let current of this.userTask.fields) {
      console.log("HERE vluae", current.value);
      if (current.required && (current.value == null || current.value === "")) {
        allRequiredFilled = false;
        break;
      }
    }

    if (allRequiredFilled) {
      this.userTask.subtasks[2].status = "done";
    }
    else {
      this.userTask.subtasks[2].status = "todo";
    }


    this.trigger();
  },

  activateView(viewId) {
    // TODO: support popups etc.
    console.log("activating", viewId);
    this.activateTab(viewId);
  },

  activateTab(tabId) {
    for (let current of this.userTask.tabs) {
      current.active = current.id === tabId;
    }
    this.trigger();
  },

  reset() {
    this.userTask = null;
    this.statuses = {};
    this.pendingChanges = new PendingChangeQueue();
  },

  loadInitialData(userTask) {
    this.reset();
    this.userTask = userTask
    this.trigger();
  },

  add(items) {
    if (!_.isArray(items)) {
      items = [items];
    }

    let itemsById = {};
    let itemIds = new Set();
    items.forEach(item => {
      itemsById[item.id] = item;
      itemIds.add(item.id);
    });

    // See if any existing items are updated by this new set of items
    this.items.forEach((item, idx) => {
      if (itemsById[item.id]) {
        this.items[idx] = {
          ...item,
          ...itemsById[item.id],
        };
        delete itemsById[item.id];
      }
    });

    // New items
    for (let itemId in itemsById) {
      this.items.push(itemsById[itemId]);
    }

    this.trigger(itemIds);
  },

  remove(itemId) {
    this.items.forEach((item, idx) => {
      if (item.id === itemId) {
        this.items.splice(idx, idx + 1);
      }
    });

    this.trigger(new Set([itemId]));
  },

  addStatus(id, status) {
    if (_.isUndefined(this.statuses[id])) {
      this.statuses[id] = {};
    }
    this.statuses[id][status] = true;
  },

  clearStatus(id, status) {
    if (_.isUndefined(this.statuses[id])) {
      return;
    }
    this.statuses[id][status] = false;
  },

  hasStatus(id, status) {
    if (_.isUndefined(this.statuses[id])) {
      return false;
    }
    return this.statuses[id][status] || false;
  },

  indexOfActivity(group_id, id) {
    let group = this.get(group_id);
    if (!group) return -1;

    for (let i = 0; i < group.activity.length; i++) {
      if (group.activity[i].id === id) {
        return i;
      }
    }
    return -1;
  },

  addActivity(data, index = -1) {
    // insert into beginning by default
    console.log("better here!");
    if (index === -1) {
      this.userTask.activity.unshift(data);
    } else {
      this.userTask.activity.splice(index, 0, data);
    }
    if (data.type === 'note') this.userTask.numComments++;

    this.trigger();
  },

  updateActivity(group_id, id, data) {
    let group = this.get(group_id);
    if (!group) return;

    let index = this.indexOfActivity(group_id, id);
    if (index === -1) return;

    // Here, we want to merge the new `data` being passed in
    // into the existing `data` object. This effectively
    // allows passing in an object of only changes.
    group.activity[index].data = Object.assign(group.activity[index].data, data);
    this.trigger(new Set([group.id]));
  },

  removeActivity(group_id, id) {
    console.log("!!! here", group_id, id);
    let group = this.get(group_id);
    if (!group) return -1;

    let index = this.indexOfActivity(group.id, id);
    if (index === -1) return -1;

    let activity = group.activity.splice(index, 1);

    if (activity[0].type === 'note') group.numComments--;

    this.trigger(new Set([group.id]));
    return index;
  },

  get(id) {
    if (this.userTask.id === id) {
      return this.userTask;
    }
    return undefined;
  },

  getAllItemIds() {
    return this.items.map(item => item.id);
  },

  getAllItems() {
    // regroup pending changes by their itemID
    let pendingById = {};
    this.pendingChanges.forEach(change => {
      if (_.isUndefined(pendingById[change.id])) {
        pendingById[change.id] = [];
      }
      pendingById[change.id].push(change);
    });

    return this.items.map(item => {
      let rItem = item;
      if (!_.isUndefined(pendingById[item.id])) {
        // copy the object so dirty state doesnt mutate original
        rItem = { ...rItem };
        pendingById[item.id].forEach(change => {
          rItem = {
            ...rItem,
            ...change.params,
          };
        });
      }
      return rItem;
    });
  },

  onAssignTo(changeId, itemId, data) {
    this.addStatus(itemId, 'assignTo');
    this.trigger(new Set([itemId]));
  },

  // TODO(dcramer): This is not really the best place for this
  onAssignToError(changeId, itemId, error) {
    this.clearStatus(itemId, 'assignTo');
    showAlert(t('Unable to change assignee. Please try again.'), 'error');
  },

  onAssignToSuccess(changeId, itemId, response) {
    let item = this.get(itemId);
    if (!item) {
      return;
    }
    item.assignedTo = response.assignedTo;
    this.clearStatus(itemId, 'assignTo');
    this.trigger(new Set([itemId]));
  },

  onDelete(changeId, itemIds) {
    itemIds = this._itemIdsOrAll(itemIds);
    itemIds.forEach(itemId => {
      this.addStatus(itemId, 'delete');
    });
    this.trigger(new Set(itemIds));
  },

  onDeleteError(changeId, itemIds, response) {
    showAlert(t('Unable to delete events. Please try again.'), 'error');

    if (!itemIds) return;

    itemIds.forEach(itemId => {
      this.clearStatus(itemId, 'delete');
    });
    this.trigger(new Set(itemIds));
  },

  onDeleteSuccess(changeId, itemIds, response) {
    itemIds = this._itemIdsOrAll(itemIds);
    let itemIdSet = new Set(itemIds);
    itemIds.forEach(itemId => {
      delete this.statuses[itemId];
      this.clearStatus(itemId, 'delete');
    });
    this.items = this.items.filter(item => !itemIdSet.has(item.id));
    showAlert(t('The selected events have been scheduled for deletion.'), 'success');
    this.trigger(new Set(itemIds));
  },

  onDiscard(changeId, itemId) {
    this.addStatus(itemId, 'discard');
    this.trigger(new Set([itemId]));
  },

  onDiscardError(changeId, itemId, response) {
    this.clearStatus(itemId, 'discard');
    showAlert(t('Unable to discard event. Please try again.'), 'error');
    this.trigger(new Set([itemId]));
  },

  onDiscardSuccess(changeId, itemId, response) {
    delete this.statuses[itemId];
    this.clearStatus(itemId, 'discard');
    this.items = this.items.filter(item => item.id !== itemId);
    showAlert(t('Similar events will be filtered and discarded.'), 'success');
    this.trigger(new Set([itemId]));
  },

  onMerge(changeId, itemIds) {
    itemIds = this._itemIdsOrAll(itemIds);

    itemIds.forEach(itemId => {
      this.addStatus(itemId, 'merge');
    });
    // XXX(billy): Not sure if this is a bug or not but do we need to publish all itemIds?
    // Seems like we only need to publish parent id
    this.trigger(new Set(itemIds));
  },

  onMergeError(changeId, itemIds, response) {
    itemIds = this._itemIdsOrAll(itemIds);

    itemIds.forEach(itemId => {
      this.clearStatus(itemId, 'merge');
    });
    showAlert(t('Unable to merge events. Please try again.'), 'error');
    this.trigger(new Set(itemIds));
  },

  onMergeSuccess(changeId, mergedIds, response) {
    mergedIds = this._itemIdsOrAll(mergedIds); // everything on page

    mergedIds.forEach(itemId => {
      this.clearStatus(itemId, 'merge');
    });

    // Remove all but parent id (items were merged into this one)
    let mergedIdSet = new Set(mergedIds);

    // Looks like the `PUT /api/0/projects/:orgId/:projectId/issues/` endpoint
    // actually returns a 204, so there is no `response` body
    this.items = this.items.filter(
      item =>
        !mergedIdSet.has(item.id) ||
        (response && response.merge && item.id === response.merge.parent)
    );

    showAlert(t('The selected events have been scheduled for merge.'), 'success');
    this.trigger(new Set(mergedIds));
  },

  /**
   * If itemIds is undefined, returns all ids in the store
   */
  _itemIdsOrAll(itemIds) {
    if (_.isUndefined(itemIds)) {
      itemIds = this.items.map(item => item.id);
    }
    return itemIds;
  },

  onUpdate(changeId, itemIds, data) {
    itemIds = this._itemIdsOrAll(itemIds);

    itemIds.forEach(itemId => {
      this.addStatus(itemId, 'update');
      this.pendingChanges.push(changeId, itemId, data);
    });
    this.trigger(new Set(itemIds));
  },

  onUpdateError(changeId, itemIds, error, failSilently) {
    itemIds = this._itemIdsOrAll(itemIds);

    this.pendingChanges.remove(changeId);
    itemIds.forEach(itemId => {
      this.clearStatus(itemId, 'update');
    });
    if (!failSilently) {
      showAlert(t('Unable to update events. Please try again.'), 'error');
    }
    this.trigger(new Set(itemIds));
  },

  onUpdateSuccess(changeId, itemIds, response) {
    itemIds = this._itemIdsOrAll(itemIds);

    this.items.forEach((item, idx) => {
      if (itemIds.indexOf(item.id) !== -1) {
        this.items[idx] = {
          ...item,
          ...response,
        };
        this.clearStatus(item.id, 'update');
      }
    });
    this.pendingChanges.remove(changeId);
    this.trigger(new Set(itemIds));
  },
});

export default UserTaskStore;
