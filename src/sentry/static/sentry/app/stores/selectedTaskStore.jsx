import Reflux from 'reflux';
import TaskStore from 'app/stores/taskStore';

const SelectedTaskStore = Reflux.createStore({
  init() {
    this.records = {};

    this.listenTo(TaskStore, this.onTaskChange, this.onTaskChange);
  },

  onTaskChange(itemIds) {
    this.prune();
    this.add(itemIds);
    this.trigger();
  },

  add(ids) {
    let allSelected = this.allSelected();
    ids.forEach(id => {
      if (!this.records.hasOwnProperty(id)) {
        this.records[id] = allSelected;
      }
    });
  },

  prune() {
    let existingIds = new Set(TaskStore.getAllItemIds());

    // Remove ids that no longer exist
    for (let itemId in this.records) {
      if (!existingIds.has(itemId)) {
        delete this.records[itemId];
      }
    }
  },

  allSelected() {
    let itemIds = this.getSelectedIds();
    let numRecords = this.numSelected();
    return itemIds.size > 0 && itemIds.size === numRecords;
  },

  numSelected() {
    return Object.keys(this.records).length;
  },

  anySelected() {
    let itemIds = this.getSelectedIds();
    return itemIds.size > 0;
  },

  identicalFieldsSelected() {
    // Returns true if there is any field selected and they all have "identical" fields to be set
    // This means that they can be edited together
    let itemIds = this.getSelectedIds();
    let selected = new Set();
    for (let itemId of itemIds) {
      let item = TaskStore.get(itemId);
      selected.add(item.fieldsetId);
    }
    return selected.size == 1;
  },

  multiSelected() {
    let itemIds = this.getSelectedIds();
    return itemIds.size > 1;
  },

  getSelectedIds() {
    let selected = new Set();
    for (let itemId in this.records) {
      if (this.records[itemId]) {
        selected.add(itemId);
      }
    }
    return selected;
  },

  isSelected(itemId) {
    return this.records[itemId] === true;
  },

  deselectAll() {
    for (let itemId in this.records) {
      this.records[itemId] = false;
    }
    this.trigger();
  },

  toggleSelect(itemId) {
    if (!this.records.hasOwnProperty(itemId)) return;
    this.records[itemId] = !this.records[itemId];
    this.trigger();
  },

  toggleSelectAll() {
    let allSelected = !this.allSelected();

    for (let itemId in this.records) {
      this.records[itemId] = allSelected;
    }

    this.trigger();
  },
});

export default SelectedTaskStore;
