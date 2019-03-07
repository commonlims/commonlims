import Reflux from 'reflux';

// TODO(dcramer): we should probably just make every parameter update
// work on bulk groups
let UserTaskActions = Reflux.createActions([
  'assignTo',
  'assignToError',
  'assignToSuccess',
  'delete',
  'deleteError',
  'deleteSuccess',
  'discard',
  'discardError',
  'discardSuccess',
  'update',
  'updateError',
  'updateSuccess',
  'merge',
  'mergeError',
  'mergeSuccess',
]);

export default UserTaskActions;
