import React from 'react';

import {
  Card,
  CardTitle,
  CardHeader,
  CardBody,
  Form,
  FormInput,
  FormTextarea,
  Button
} from 'shards-react';

import TagSelector from './TagSelector';
import NoteTagBadge from './noteoverlay/NoteTagBadge';
import API from '../../service/Api';
import alerts from '../../service/Alerts';


export default class NewNoteView extends React.Component {

  constructor(props) {
    super(props);
    this.state = { tags: [] };
  }

  newNote() {
    const titleEl = document.getElementById('new-note-title');
    const markdownEl = document.getElementById('new-note-text');
    const tags = [...new Set(this.state.tags)];
    const body = { title: titleEl.value, markdown: markdownEl.value, tags };
    API.call('POST', '/v0/notes', body)
      .then(res => {
        this.props.onNewNote(res);
        alerts.showAlert('Saved new note.', 'success');
        this.setState({ tags: [] })
        titleEl.value = '';
        markdownEl.value = '';
      })
      .catch(err => {
        alerts.showAlert(`Error saving note: ${err.toString()}`, 'danger')
      });
  }

  addTag(tag) {
    this.setState(state => ({ tags: [...new Set([...state.tags, tag])] }));
  }

  removeTag(tag) {
    this.setState(state => ({ tags: state.tags.filter(t => t !== tag) }));
  }

  render() {
    const tagBadges = this.state.tags.map((tag, index) => <NoteTagBadge key={index} onRemove={() => this.removeTag(tag)}>{tag}</NoteTagBadge>);
    return <Card id="new-note" className="note-card" >
      <CardHeader><CardTitle>Create a new Note</CardTitle></CardHeader>
      <CardBody>
        <Form id="new-note-form">
          <FormInput placeholder="Title or URL" id="new-note-title"></FormInput>
          <FormTextarea
            id="new-note-text"
            style={{ marginTop: '20px', flexGrow: 1 }}
            placeholder="Enter markdown here" />
          <div style={{ height: '10px' }} />
          <div>{tagBadges}</div>
          <div style={{ height: '10px' }} />
          <div style={{ display: 'flex' }}>
            <TagSelector onAddTag={this.addTag.bind(this)} />
            <div style={{flexGrow: 1}} />
            <Button
              theme="primary"
              size="sm"
              onClick={this.newNote.bind(this)}
              style={{ marginLeft: '10px' }}
            >Save</Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  }
}