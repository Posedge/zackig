const initialState = null;

export default function alertReducer(state = initialState, action) {
  switch (action.type) {
    case 'SHOW_ALERT':
      return {
        message: action.message,
        theme: action.theme
      };
    case 'CLEAR_ALERT':
      return null;
    default:
      return state;
  }
}