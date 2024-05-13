import { legacy_createStore as createStore, combineReducers } from 'redux';

const store = createStore(combineReducers({
  // Ваши редукторы здесь
}));

export default store;
