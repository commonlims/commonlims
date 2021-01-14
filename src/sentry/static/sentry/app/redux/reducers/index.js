import {combineReducers} from 'redux';

import process from './process';
import processAssignment from './processAssignment';
import processDefinition from './processDefinition';
import savedSearch from './savedSearch';
import substanceSearchEntry from './substanceSearchEntry';
import tag from './tag';
import workDefinitionEntry from 'app/redux/reducers/workDefinitionEntry';
import workBatch from './workBatch';
import workBatchDetails from './workBatchDetails';
import projectSearchEntry from './projectSearchEntry';
import workBatchDefinitionEntry from './workBatchDefinitionEntry';
import workBatchEntry from './workBatchEntry';
import workBatchDetailsEntry from './workBatchDetailsEntry';
import availableWork from './availableWork';
import availableWorkUnit from './availableWorkUnit';

export default combineReducers({
  process,
  processAssignment,
  processDefinition,
  savedSearch,
  substanceSearchEntry,
  tag,
  workDefinitionEntry,
  workBatch,
  workBatchDetails,
  projectSearchEntry,
  workBatchDefinitionEntry,
  workBatchEntry,
  workBatchDetailsEntry,
  availableWork,
  availableWorkUnit,
});
