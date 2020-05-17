import React from 'react';
import ReactHtmlParser from 'react-html-parser';
import {
  Card,
  CardBody,
  CardTitle,
  Button,
} from 'shards-react';
import { connect } from 'react-redux';

import './Overlay.css';
import NoteOverlayFooter from './NoteOverlayFooter';
import { closeNote } from '../../../store';


/**
 * Shows a dialog with a single note - displaying it in rendered HTML.
 */
class DisplayNoteOverlay extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      preview: null,
      loadingPreview: false
    };
  }

  componentDidMount() {
    const note = this.props.note;
    if (note.isLink()) {
      this.setState({loadingPreview: true});
      note.fetchPreview()
        .then(preview => this.setState({preview}))
        .catch(err => console.log(`failed to fetch URL preview for ${note.title}: ${err}`))
        .finally(() => {this.setState({loadingPreview: false})})
    }
  }

  deleteNote() {
    this.props.note.delete()
      .finally(() => this.props.dispatch(closeNote()));
  }

  onRemoveNoteTag(tag) {
    const tags = this.props.note.tags.filter(t => t !== tag);
    this.props.saveNote(this.props.note.title, this.props.note.markdown, tags)
      .then(() => this.forceUpdate());
  }

  renderImage(url) {
    return <img
      className="overlay-image"
      src={`${window.config.API_URL}/v0/imageproxy?url=${url}`}
      alt="" />;
  }

  renderPreview() {
    if (this.state.loadingPreview) {
      return '🌎 Loading...';
    }
    const preview = this.state.preview;
    if (!preview) {
      return null;
    }
    return <>
      <div>
        {preview.image_url ? this.renderImage(preview.image_url) : ''}
        <h3>{preview.title}</h3>
        {preview.description}
      </div>
      <div><hr /></div>
    </>;
  }

  renderTitle() {
    const title = this.props.note.title;
    if (this.props.note.isLink()) {
      const url = this.props.note.getUrl();
      return <a href={url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
        {url} <span role="img" aria-label="external link">🌎</span> <i className="material-icons">open_in_new</i>
      </a>;
    }
    return title || <span>&nbsp;</span>;
  }

  render() {
    return <div className="overlay">
      <Card className="overlay-card">
        <CardBody className="overlay-card-body">
          <CardTitle>
            {this.renderTitle()}
            <Button
              size="sm"
              theme="light"
              className="close-button"
              onClick={() => this.props.dispatch(closeNote())}>Close</Button>
            <hr></hr>
          </CardTitle>
          {this.renderPreview()}
          <div className="rendered-content">{ReactHtmlParser(this.props.note.html)}</div>
        </CardBody>
        <NoteOverlayFooter/>
      </Card>
    </div>;
  }
}

const stateToProps = state => ({
  note: state.notes.notes.find(note => note.id === state.notes.displayedNoteId)
});
export default connect(stateToProps)(DisplayNoteOverlay);