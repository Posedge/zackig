import React from 'react';
import { Button, Badge } from 'shards-react';


const COLORS = [
  "Azure", "BurlyWood", "BlueViolet", "CornflowerBlue", "LightGreen",
  "LighYellow", "LightSlateGrey", "Linen", "MediumSeaGreen", "MintCream",
  "PlaeTurquoise", "Teal", "Wheat"
];

function hashString(str) {
  let hash = 0, i, chr;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

export function getTagColor(tag) {
  const hash = hashString(tag);
  return COLORS[hash % COLORS.length];
}

export default class NoteTagBadge extends React.PureComponent {
  render() {
    const color = getTagColor(this.props.children);
    return <Badge pill className="badge" style={{ backgroundColor: color }}>
      {this.props.children}
      {
        !this.props.readOnly && <Button
          theme="light"
          className="badge-close-button"
          onClick={this.props.onRemove}
        >x</Button>
      }
    </Badge>;
  }
}