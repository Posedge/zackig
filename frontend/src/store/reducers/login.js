const initialState = {
  username: null,
  isLoggingIn: false,
  isRegistering: false,
  note: null
};

export default function loginReducer(state = initialState, action) {
  switch (action.type) {
    case 'LOGIN':
      return {...state, isLoggingIn: true, note: action.note}
    case 'LOGIN_SUCCESS':
      return {...state, isLoggingIn: false, username: action.username, note: action.note};
    case 'LOGIN_ERROR':
      return {...state, isLoggingIn: false, username: null, note: action.error};
    case 'LOGOUT':
      return state;
    case 'LOGOUT_SUCCESS':
      return {...state, isLoggingIn: false, username: null, note: null};
    case 'LOGOUT_ERROR':
      return {...state, isLoggingIn: false, username: null, note: null};
    case 'REGISTER':
      return {...state, isRegistering: true, note: 'Registering...'};
    case 'REGISTER_SUCCESS':
      return {...state, isRegistering: false, note: action.note};
    case 'REGISTER_ERROR':
      return {...state, isRegistering: false, note: action.error};
    default:
      return state;
  }
}