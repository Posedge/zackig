import React from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  Button,
} from 'shards-react';
import { connect } from 'react-redux';

import './Overlay.css';
import { FormInputWithDefault, FormTextareaWithDefault } from '../../layout/FormInputWithDefault';
import { closeNote } from '../../../store';
import NoteOverlayFooter from './NoteOverlayFooter';



/**
 * Shows a dialog with an editor for a single note.
 */
class EditNoteOverlay extends React.Component {

  render() {
    if (this.props.isSavingNote) {
      return <div className="overlay">
        <Card className="overlay-card">
          <CardBody className="overlay-card-body">
            Saving...
          </CardBody>
        </Card>
      </div>;
    }
    return <div className="overlay">
      <Card className="overlay-card">
        <CardBody className="overlay-card-body">
          <CardTitle>
            <FormInputWithDefault
              size="sm"
              id="edit-note-title"
              default={this.props.note.title} />
            <Button
              size="sm"
              theme="light"
              className="close-button"
              onClick={() => this.props.dispatch(closeNote())}>Close</Button>
            <hr></hr>
          </CardTitle>
          <div id="edit-note-text-wrapper">
            <FormTextareaWithDefault
              id="edit-note-text"
              default={this.props.note.markdown} />;
          </div>
        </CardBody>
        <NoteOverlayFooter />
      </Card>
    </div>;
  }
}

const stateToProps = state => ({ 
  note: state.notes.notes.find(note => note.id === state.notes.editedNoteId),
  isSavingNote: state.notes.savingNoteId !== null
});
export default connect(stateToProps)(EditNoteOverlay);