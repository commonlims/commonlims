import {combineReducers} from 'redux';

import process from './process';
import processAssignment from './processAssignment';
import processDefinition from './processDefinition';
import savedSearch from './savedSearch';
import substance from './substance';
import tag from './tag';
import task from './task';
import taskDefinition from './taskDefinition';
import workBatch from './workBatch';
import workBatchDetails from './workBatchDetails';
import projectSearchEntry from './projectSearchEntry';

export default combineReducers({
  process,
  processAssignment,
  processDefinition,
  savedSearch,
  substance,
  tag,
  task,
  taskDefinition,
  workBatch,
  workBatchDetails,
  projectSearchEntry,
});
