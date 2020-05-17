export const login = note => ({ type: 'LOGIN', note }); 
export const loginSuccess = (username, note) => ({ type: 'LOGIN_SUCCESS', username, note });
export const loginError = error => ({ type: 'LOGIN_ERROR', error });

export const logout = () => ({ type: 'LOGOUT' });
export const logoutSuccess = () => ({ type: 'LOGOUT_SUCCESS' });
export const logoutError = err => ({ type: 'LOGOUT_ERROR' });

export const register = () => ({ type: 'REGISTER' });
export const registerSuccess = note => ({ type: 'REGISTER_SUCCESS', note });
export const registerError = error => ({ type: 'REGISTER_ERROR', error });

export const showAlert = (message, theme) => ({ type: 'SHOW_ALERT', message, theme });
export const clearAlert = () => ({ type: 'CLEAR_ALERT' });

export const fetchNotes = () => ({ type: 'FETCH_NOTES' });
export const fetchNotesSuccess = notes => ({ type: 'FETCH_NOTES_SUCCESS', notes });
export const fetchNotesError = error => ({ type: 'FETCH_NOTES_ERROR', error });

export const displayNote = noteid => ({ type: 'DISPLAY_NOTE', noteid });
export const editNote = noteid => ({ type: 'EDIT_NOTE', noteid });
export const closeNote = () => ({ type: 'CLOSE_NOTE' });

export const saveNote = note => ({ type: 'SAVE_NOTE', note });
export const saveNoteSuccess = note => ({ type: 'SAVE_NOTE_SUCCESS', note });
export const saveNoteError = error => ({ type: 'SAVE_NOTE_ERROR', error });

export const deleteNote = note => ({ type: 'DELETE_NOTE', note });
export const deleteNoteSuccess = note => ({ type: 'DELETE_NOTE_SUCCESS', note });
export const deleteNoteError = error => ({ type: 'DELETE_NOTE_ERROR', error });

export const filterViewByTag = tag => ({ type: 'FILTER_VIEW_BY_TAG', tag });