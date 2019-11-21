import {combineReducers} from 'redux';
import tag from './tag';
import task from './task';
import workBatch from './workBatch';
import savedSearch from './savedSearch';
import substanceSearchEntry from './substanceSearchEntry';

export default combineReducers({
  tag,
  task,
  workBatch,
  savedSearch,
  substanceSearchEntry,
});
