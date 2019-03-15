import Reflux from 'reflux';
import TeamActions from 'app/actions/teamActions';

const TeamStore = Reflux.createStore({
  init() {
    this.initialized = false;
    this.reset();

    this.listenTo(TeamActions.updateSuccess, this.onUpdateSuccess);
    this.listenTo(TeamActions.fetchDetailsSuccess, this.onUpdateSuccess);
    this.listenTo(TeamActions.removeTeamSuccess, this.onRemoveSuccess);
    this.listenTo(TeamActions.createTeamSuccess, this.onCreateSuccess);
  },

  reset() {
    this.items = [];
  },

  loadInitialData(items) {
    console.log("LOADING TEAMS", items);
    console.trace();
    this.initialized = true;
    this.items = items;
    this.trigger(new Set(items.map(item => item.id)));
  },

  onUpdateSuccess(itemId, response) {
    console.log("LOADING TEAMS!");
    if (!response) return;

    let item = this.getBySlug(itemId);

    if (!item) {
      this.items.push(response);
    } else {
      // Slug was changed
      // Note: This is the proper way to handle slug changes but unfortunately not all of our
      // components use stores correctly. To be safe reload browser :((
      if (response.slug !== itemId) {
        // Remove old team
        this.items = this.items.filter(({ slug }) => slug !== itemId);
        // Add team w/ updated slug
        this.items.push(response);
        this.trigger(new Set([response.slug]));
        return;
      }

      $.extend(true /*deep*/, item, response);
    }

    this.trigger(new Set([itemId]));
  },

  onRemoveSuccess(slug) {
    console.log("LOADING TEAMS!!");
    this.loadInitialData(this.items.filter(team => team.slug !== slug));
  },

  onCreateSuccess(team) {
    console.log("LOADING TEAMS3");
    this.loadInitialData([...this.items, team]);
  },

  getById(id) {
    console.log("LOADING TEAMS4");
    return this.items.find(item => item.id.toString() === id.toString()) || null;
  },

  getBySlug(slug) {
    console.log("LOADING TEAMS5");
    return this.items.find(item => item.slug === slug) || null;
  },

  getActive() {
    console.log("LOADING TEAMS6");
    return this.items.filter(item => item.isMember);
  },

  getAll() {
    console.log("LOADING TEAMS7");
    return this.items;
  },
});

export default TeamStore;
