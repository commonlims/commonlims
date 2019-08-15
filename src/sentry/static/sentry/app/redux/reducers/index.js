import {combineReducers} from 'redux';
import tag from './tag';
import task from './task';
import workBatch from './workBatch';

export default combineReducers({
  tag,
  task,
  workBatch,
});
