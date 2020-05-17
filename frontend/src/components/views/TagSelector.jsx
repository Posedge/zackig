import React from 'react';
import { connect } from "react-redux";
import {
  FormInput,
  Button,
  Dropdown,
  DropdownMenu,
  DropdownItem
} from 'shards-react';

import { getTagColor } from './noteoverlay/NoteTagBadge';


class TagSelector extends React.Component {

  constructor(props) {
    super(props);
    this.state = { suggestionsOpen: false };
    this.inputRef = null;
  }

  addTag(tag) {
    if (!tag) return;
    this.setState({ suggestionsOpen: false });
    this.inputRef.value = '';
    this.props.onAddTag(tag);
  }

  openSuggestions() {
    this.setState({ suggestionsOpen: true });
  }

  closeSuggestions() {
    this.setState({ suggestionsOpen: false });
  }

  renderTagList(tagList) {
    return tagList.map(tag => <DropdownItem
      onClick={() => this.addTag(tag)}
      style={{ backgroundColor: getTagColor(tag) }}
    >{tag}</DropdownItem>)
  }

  render() {
    const notes = this.props.notes.notes || [];
    const allTags = notes.map(note => note.tags).flat()
    const tagList = [...new Set(allTags)].sort();
    return (
      <div style={{display: 'flex'}}>
        <Dropdown
          dropup
          toggle={this.closeSuggestions.bind(this)}
          open={this.state.suggestionsOpen}>
          <FormInput
            innerRef={ref => {
              if (!ref) return;
              this.inputRef = ref;
              this.inputRef.addEventListener('focus', this.openSuggestions.bind(this));
            }}
            placeholder="Tag this note"
            size="sm" />
          {tagList.length > 0 && <DropdownMenu>
            {this.renderTagList(tagList)}
          </DropdownMenu>}
        </Dropdown>
        <Button
          theme="primary"
          size="sm"
          style={{ marginLeft: '2px', marginRight: '4px' }}
          onClick={() => this.addTag(this.inputRef.value)}
        >+</Button>
      </div>
    );
  }
}

const stateToProps = state => ({ notes: state.notes });
export default connect(stateToProps)(TagSelector)