import Reflux from 'reflux';
import _ from 'lodash';

import ProcessTagActions from 'app/actions/processTagActions';
import MemberListStore from 'app/stores/memberListStore';

const uuidPattern = /[0-9a-f]{32}$/;

const getUsername = ({isManaged, username, email}) => {
  // Users created via SAML receive unique UUID usernames. Use
  // their email in these cases, instead.
  if (username && uuidPattern.test(username)) {
    return email;
  } else {
    return !isManaged && username ? username : email;
  }
};

const getMemberListStoreUsernames = () => {
  return MemberListStore.getAll().map(getUsername);
};

const ProcessTagStore = Reflux.createStore({
  listenables: ProcessTagActions,

  init() {
    this.listenTo(MemberListStore, this.onMemberListStoreChange);
    this.reset();
  },

  reset() {
    this.tags = {
      is: {
        key: 'is',
        name: 'Status',
        values: ['resolved', 'unresolved', 'ignored', 'assigned', 'unassigned'],
        predefined: true,
      },

      assigned: {
        key: 'assigned',
        name: 'Assigned To',
        values: getMemberListStoreUsernames(),
        predefined: true,
      },

      bookmarks: {
        key: 'bookmarks',
        name: 'Bookmarked By',
        values: getMemberListStoreUsernames(),
        predefined: true,
      },

      process: {
        key: 'process',
        name: 'Process',
        values: [],
        predefined: false,
      },

      task: {
        key: 'task-type',
        name: 'Task type',
        values: [],
        predefined: false,
      },

      created: {
        key: 'created',
        name: 'Created',
        values: [
          '-1h',
          '-1d',
          '2018-01-02',
          '>=2018-01-02T01:00:00',
          '<2018-01-02T02:00:00',
        ],
        predefined: true,
      },

      has: {
        key: 'has',
        name: 'Has Tag',
        values: [],
        predefined: true,
      },
    };
    this.trigger(this.tags);
  },

  getTag(tagName) {
    return this.tags[tagName];
  },

  getAllTags() {
    return this.tags;
  },

  getTagKeys() {
    return Object.keys(this.tags);
  },

  getTagValues(tagKey, query) {
    return this.tags[tagKey].values || [];
  },

  onLoadProcessTagsSuccess(data) {
    Object.assign(
      this.tags,
      _.reduce(
        data,
        (obj, tag) => {
          tag = Object.assign(
            {
              values: [],
            },
            tag
          );

          let old = this.tags[tag.key];

          // Don't override predefined filters (e.g. "is")
          if (!old || !old.predefined) obj[tag.key] = tag;

          return obj;
        },
        {}
      )
    );
    this.tags.has.values = data.map(tag => tag.key);
    this.trigger(this.tags);
  },

  onMemberListStoreChange(members) {
    let assignedTag = this.tags.assigned;
    assignedTag.values = getMemberListStoreUsernames();
    assignedTag.values.unshift('me');
    this.tags.bookmarks.values = assignedTag.values;
    this.trigger(this.tags);
  },
});

export default ProcessTagStore;
