import React from 'react';
import { connect } from 'react-redux';

import './Dashboard.css';
import DisplayNoteOverlay from './noteoverlay/DisplayNoteOverlay';
import EditNoteOverlay from './noteoverlay/EditNoteOverlay';
import NoteCard from './NoteCard';
import NewNoteCard from './NewNoteCard';
import Note from '../../model/Note';
import API from '../../service/Api';
import alerts from '../../service/Alerts';
import {
  fetchNotes,
  fetchNotesSuccess,
  fetchNotesError
} from '../../store';


class Dashboard extends React.Component {

  componentDidMount() {
    this.fetchNotes();
  }

  fetchNotes() {
    this.props.dispatch(fetchNotes());
    API.call('GET', '/v0/notes')
      .then(body => {
        const notes = body.notes.map(data => new Note(data));
        this.props.dispatch(fetchNotesSuccess(notes));
      })
      .catch(err => {
        this.props.dispatch(fetchNotesError(err));
        alerts.showAlert(`Error fetching notes! ${err}`, 'danger');
      });
  }

  render() {
    return (
      <>
        {this.props.displayedNoteId !== null && <DisplayNoteOverlay />}
        {this.props.editedNoteId !== null && <EditNoteOverlay />}
        <div className="note-container">
          <NewNoteCard onNewNote={this.fetchNotes.bind(this)} />
          {this.renderNotes()}
        </div>
      </>
    );
  }

  renderNotes() {
    const notes = this.props.notes || [];
    const noteFilter = this.props.filterByTag === null
      ? () => true
      : note => note.tags.includes(this.props.filterByTag)
    const noteElements = notes
      .filter(noteFilter)
      .map(note => <NoteCard
        note={note}
        key={note.id}
      />);

    return [
      ...noteElements,

      // Add placeholders to make sure elements on the last row are not stretched.
      // Since we have rows of three elements, we need at most two placeholders.
      <div className="note-card placeholder" key="placeholder0"></div>,
      <div className="note-card placeholder" key="placeholder1"></div>
    ];
  }

}

const stateToProps = state => ({...state.notes, ...state.view});
export default connect(stateToProps)(Dashboard);