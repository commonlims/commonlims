import Reflux from 'reflux';

import SampleTransitionActions from 'app/actions/sampleTransitionActions';

const SampleTransitionsStore = Reflux.createStore({
  listenables: [SampleTransitionActions],

  // So we can use Reflux.connect in a component mixin
  getInitialState() {
    return this.items;
  },

  init() {
    this.sampleTransitions = [];
  },
});

export default SampleTransitionsStore;
