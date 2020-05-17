/**
 * I couldn't figure out how to set a default text
 * (that's NOT a placeholder) in a <FormInput />.
 * I'm building this workaround for now, let's see if it works well.
 */

import React from 'react';
import { FormInput, FormTextarea } from 'shards-react';


export class FormInputWithDefault extends React.Component {
  componentDidMount() {
    document.getElementById(this.props.id).value = this.props.default;
  }

  render() {
    return <FormInput
      id={this.props.id}
      size={this.props.size}
      theme={this.props.theme}
      style={this.props.style} />;
  }
}


export class FormTextareaWithDefault extends React.Component {
  componentDidMount() {
    document.getElementById(this.props.id).value = this.props.default;
  }

  render() {
    return <FormTextarea
      id={this.props.id}
      size={this.props.size}
      theme={this.props.theme}
      style={this.props.style} />;
  }
}