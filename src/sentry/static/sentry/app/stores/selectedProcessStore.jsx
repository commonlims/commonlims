import Reflux from 'reflux';
import ProcessStore from 'app/stores/processStore';

const SelectedProcessStore = Reflux.createStore({
  init() {
    this.records = {};

    this.listenTo(ProcessStore, this.onProcessChange, this.onProcessChange);
  },

  onProcessChange(itemIds) {
    this.prune();
    this.add(itemIds);
    this.trigger();
  },

  add(ids) {
    const allSelected = this.allSelected();
    ids.forEach(id => {
      if (!this.records.hasOwnProperty(id)) {
        this.records[id] = allSelected;
      }
    });
  },

  prune() {
    const existingIds = new Set(ProcessStore.getAllItemIds());

    // Remove ids that no longer exist
    for (const itemId in this.records) {
      if (!existingIds.has(itemId)) {
        delete this.records[itemId];
      }
    }
  },

  allSelected() {
    const itemIds = this.getSelectedIds();
    const numRecords = this.numSelected();
    return itemIds.size > 0 && itemIds.size === numRecords;
  },

  numSelected() {
    return Object.keys(this.records).length;
  },

  anySelected() {
    const itemIds = this.getSelectedIds();
    return itemIds.size > 0;
  },

  identicalFieldsSelected() {
    // Returns true if there is any field selected and they all have "identical" fields to be set
    // This means that they can be edited together
    const itemIds = this.getSelectedIds();
    const selected = new Set();
    for (const itemId of itemIds) {
      const item = ProcessStore.get(itemId);
      selected.add(item.fieldsetId);
    }
    return selected.size == 1;
  },

  multiSelected() {
    const itemIds = this.getSelectedIds();
    return itemIds.size > 1;
  },

  getSelectedIds() {
    const selected = new Set();
    for (const itemId in this.records) {
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
    for (const itemId in this.records) {
      this.records[itemId] = false;
    }
    this.trigger();
  },

  toggleSelect(itemId) {
    if (!this.records.hasOwnProperty(itemId)) {
      return;
    }
    this.records[itemId] = !this.records[itemId];
    this.trigger();
  },

  toggleSelectAll() {
    const allSelected = !this.allSelected();

    for (const itemId in this.records) {
      this.records[itemId] = allSelected;
    }

    this.trigger();
  },
});

export default SelectedProcessStore;
