import Reflux from 'reflux';

let ProcessActions = Reflux.createActions([
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

export default ProcessActions;
