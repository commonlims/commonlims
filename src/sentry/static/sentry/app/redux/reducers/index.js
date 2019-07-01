import {combineReducers} from 'redux';
import tag from './tag';
import userTask from './userTask';

export default combineReducers({
  tag,
  userTask,
});
