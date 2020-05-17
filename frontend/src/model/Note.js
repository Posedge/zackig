import marked from 'marked';
import createDOMPurify from 'dompurify';

import API from '../service/Api';
import alerts from '../service/Alerts';
import store, {
  saveNote, saveNoteSuccess, saveNoteError,
  deleteNote, deleteNoteSuccess, deleteNoteError
} from '../store';


const URL_REGEX = /^(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)$/


export default class Note {

  constructor(data) {
    this._sanitizer = createDOMPurify(window);

    const {title, markdown, id, tags} = data;
    this.markdown = markdown;
    this.title = title;
    this.id = id;
    this.tags = tags;
    this.html = this._render();
  }

  /**
   * Saves a new note in the database, and returns a copy of the updated note.
   */
  update(title, markdown, tags) {
    store.dispatch(saveNote(this));
    const body = { title, markdown, tags };
    return API.call('PUT', `/v0/notes/${this.id}`, body)
      .then(() => {
        const newNote = new Note({id: this.id, title, markdown, tags});
        store.dispatch(saveNoteSuccess(newNote));
        alerts.showAlert('Saved note.', 'success');
        return Promise.resolve(newNote);
      })
      .catch(err => {
        store.dispatch(saveNoteError(err));
        alerts.showAlert(`Error saving note: ${err.toString()}`, 'danger');
        return Promise.reject(err);
      });
  }

  /**
   * Delete in the database.
   */
  delete() {
    store.dispatch(deleteNote(this));
    return API.call('DELETE', `/v0/notes/${this.id}`)
      .then(() => {
        alerts.showAlert('Deleted note.', 'success');
        store.dispatch(deleteNoteSuccess(this));
      })
      .catch(err => {
        alerts.showAlert(`Error deleting note: ${err.toString()}`, 'danger');
        store.dispatch(deleteNoteError(err));
      })
  }

  _render() {
    const rawHtml = marked(this.markdown);
    return this._sanitizer.sanitize(rawHtml);
  }

  isLink() {
    return URL_REGEX.test(this.title);
  }

  getUrl() {
    const url = this.title;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `http://${url}`;
    }
    return url;
  }

  fetchPreview() {
    return API.call('GET', `/v0/linkpreview?url=${encodeURI(this.title)}`);
  }

}
