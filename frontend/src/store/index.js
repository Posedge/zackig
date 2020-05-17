import { combineReducers, createStore } from 'redux';

import login from './reducers/login';
import alert from './reducers/alert';
import notes from './reducers/notes';
import view from './reducers/view';
export * from './actions';

const reducers = combineReducers({login, alert, notes, view});
export default createStore(
  reducers,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());