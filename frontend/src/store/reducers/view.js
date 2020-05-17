const initialState = {
  filterByTag: null
};

export default function viewReducer(state = initialState, action) {
  switch (action.type) {
    case 'FILTER_VIEW_BY_TAG':
      return { ...state, filterByTag: action.tag };
    default:
      return state;
  }
}