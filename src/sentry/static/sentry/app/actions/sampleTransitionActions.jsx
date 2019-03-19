import Reflux from 'reflux';

let SampleTransitionActions = Reflux.createActions([
  'loadInitialState',
  'add',
  'remove',
  'saveDraft',
  'saveDraftSuccess',
  'saveDraftError',
  'saveConfirmed',
  'saveConfirmedSuccess',
  'saveConfirmedError',
]);

export default SampleTransitionActions;
