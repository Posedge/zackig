import React from 'react';
import ReactHtmlParser from 'react-html-parser';
import { connect } from 'react-redux';
import {
  Card,
  CardTitle,
  CardBody,
  Button
} from 'shards-react';

import NoteTagBadge from './noteoverlay/NoteTagBadge';
import { displayNote } from '../../store';


class NoteCard extends React.Component {

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

  onClick(e) {
    e.preventDefault();
    this.props.dispatch(displayNote(this.props.note.id));
  }

  deleteNote() {
    this.props.note.delete();
  }

  /**
   * Converts a html string into a tree of React elements.
   */
  renderHtml(html) {
    return ReactHtmlParser(html);
  }

  renderImageElement(url) {
    return <img
    className="background-image"
      src={`${window.config.API_URL}/v0/imageproxy?url=${url}`}
      alt="" />;
  }

  renderTitle() {
    const preview = this.state.preview;
    if (this.props.note.isLink()) {
      const url = preview ? preview.url : this.props.note.getUrl();
      const title = preview ? preview.title : url;
      return <CardTitle>
        <a href={url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
          {title} <span role="img" aria-label="external link">🌎</span> <i className="material-icons">open_in_new</i>
        </a><hr />
      </CardTitle>;
    } else {
      return this.props.note.title && <CardTitle>{this.props.note.title}<hr /></CardTitle>;
    }
  }

  renderDescription() {
    if (this.state.loadingPreview) {
      return '🌎 Loading...';
    }
    const preview = this.state.preview;
    return preview ? preview.description : this.renderHtml(this.props.note.html);
  }

  render() {
    const preview = this.state.preview;
    const image = preview && preview.image_url ? this.renderImageElement(preview.image_url) : '';
    const tags = this.props.note.tags.map((tag, index) => <NoteTagBadge key={index} readOnly>{tag}</NoteTagBadge>);

    return <Card className="note-card" onClick={this.onClick.bind(this)}>
      <CardBody className="note-card-body">
        {this.renderTitle()}
        <div className="note-card-content">{this.renderDescription()}</div>
        <div class="note-card-footer">
          <div style={{flexGrow: 1}}>{tags}</div>
          <Button
            size="sm"
            theme="danger"
            style={{ alignSelf: 'flex-end' }}
            onClick={this.deleteNote.bind(this)}
          >X</Button>
        </div>
        {image}
      </CardBody>
    </Card>
  }
}

export default connect()(NoteCard);