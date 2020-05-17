import React from 'react';
import { connect } from "react-redux";
import {
  Button,
  CardFooter
} from 'shards-react'

import './Overlay.css';
import NoteTagBadge from './NoteTagBadge';
import TagSelector from '../TagSelector';
import { closeNote, editNote, displayNote } from '../../../store';


class NoteOverlayFooter extends React.Component {

  saveNote() {
    const newTitle = document.getElementById('edit-note-title').value;
    const newMarkdown = document.getElementById('edit-note-text').value;
    this.props.note.update(newTitle, newMarkdown, this.props.note.tags)
      .finally(() => this.props.dispatch(displayNote(this.props.note.id)));
  }

  deleteNote() {
    this.props.note.delete()
      .finally(() => this.props.dispatch(closeNote()));
  }

  addTag(tag) {
    const note = this.props.note;
    const tagSet = new Set([...note.tags, tag]);
    note.update(note.title, note.markdown, [...tagSet]);
  }

  removeTag(toRemove) {
    const note = this.props.note;
    note.update(note.title, note.markdown, note.tags.filter(tag => tag !== toRemove));
  }

  render() {
    const tags = this.props.note.tags
      .map((tag, index) => <NoteTagBadge
        key={index}
        onRemove={() => this.removeTag(tag)}
      >{tag}</NoteTagBadge>);
    return <CardFooter className="footer">
      <TagSelector onAddTag={this.addTag.bind(this)} />
      <div style={{ flexGrow: 1 }}>{tags}</div>
      {
        this.props.isEditMode
          ? <Button
            size="sm"
            theme="success"
            className="footer-button"
            onClick={this.saveNote.bind(this)}
          >Save</Button>
          : <Button
            size="sm"
            theme="light"
            className="footer-button"
            onClick={() => this.props.dispatch(editNote(this.props.note.id))}
          >Edit</Button>
      }
      <Button
        size="sm"
        theme="light"
        className="footer-button"
        onClick={() => {/* TODO */ }}
      >Archive</Button>
      <Button
        size="sm"
        theme="danger"
        className="footer-button"
        onClick={this.deleteNote.bind(this)}
      >Delete</Button>
    </CardFooter>
  }
}

const stateToProps = state => ({
  note: state.notes.notes.find(note =>
    note.id === state.notes.editedNoteId
    || note.id === state.notes.displayedNoteId),
  isEditMode: state.notes.editedNoteId !== null
})
export default connect(stateToProps)(NoteOverlayFooter);