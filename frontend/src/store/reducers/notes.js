const initialState = {
  isFetchingNotes: false,
  notes: null,
  displayedNoteId: null,
  editedNoteId: null,
  savingNoteId: null,
  deletingNoteId: null
};

export default function notesReducer(state = initialState, action) {
  switch (action.type) {
    case 'FETCH_NOTES':
      return { ...state, isFetchingNotes: true };
    case 'FETCH_NOTES_SUCCESS':
      return { ...state, isFetchingNotes: false, notes: action.notes };
    case 'FETCH_NOTES_ERROR':
      return { ...state, isFetchingNotes: true, notes: null };
    case 'DISPLAY_NOTE':
      return { ...state, displayedNoteId: action.noteid, editedNoteId: null };
    case 'EDIT_NOTE':
      return { ...state, displayedNoteId: null, editedNoteId: action.noteid };
    case 'CLOSE_NOTE':
      return { ...state, displayedNoteId: null, editedNoteId: null };
    case 'SAVE_NOTE':
      return { ...state, savingNoteId: action.note.id };
    case 'SAVE_NOTE_SUCCESS':
      const newNotes = state.notes.map(note => 
        note.id === action.note.id ? action.note : note
      );
      return { ...state, notes: newNotes, savingNoteId: null };
    case 'SAVE_NOTE_ERROR':
      return { ...state, savingNoteId: null };
    case 'DELETE_NOTE':
      return { ...state, deletingNoteId: action.note.id };
    case 'DELETE_NOTE_SUCCESS':
      const filteredNotes = state.notes.filter(note => 
        note.id !== action.note.id
      );
      return { ...state, notes: filteredNotes, deletingNoteId: null, editedNoteId: null, displayedNoteId: null };
    case 'DELETE_NOTE_ERROR':
      return { ...state, deletingNoteId: null };
    default:
      return state;
  }
};