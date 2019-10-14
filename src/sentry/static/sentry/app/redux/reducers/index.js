import {combineReducers} from 'redux';
import tag from './tag';
import task from './task';
import workBatch from './workBatch';
import substance from './substance';

export default combineReducers({
  tag,
  task,
  workBatch,
  substance,
});
