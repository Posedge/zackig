import React from 'react';
import { connect } from 'react-redux';

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Form,
  FormInput,
  FormGroup,
  FormCheckbox
} from 'shards-react';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'shards-ui/dist/css/shards.min.css';

import API from '../../service/Api';
import { login, loginSuccess, loginError, register, registerError, registerSuccess } from '../../store';


class Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = { persistent: false };
  }

  componentDidMount() {
    this.whoami();
  }

  whoami() {
    this.props.dispatch(login('Logging in...'));
    API.call('GET', '/v0/whoami', null, {credentials: 'include'})
      .then((body) => {
        // User is logged in
        this.props.dispatch(loginSuccess(body.username));
      })
      .catch((err) => {
        if (err && err.status && err.status === 401) {
          // User is not logged in
          this.props.dispatch(loginError());
        } else {
          // Unexpected error
          this.props.dispatch(loginError(err.toString()));
        }
      });
  }

  register() {
    this.props.dispatch(register())
    const body = {
      username: document.getElementById('username').value,
      password: document.getElementById('password').value
    };
    API.call('POST', '/v0/register', body)
      .then(body => this.props.dispatch(registerSuccess(body.message)))
      .catch(err => this.props.dispatch(registerError(err.toString())));
  }

  logIn() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const body = {username, password, persistent: this.state.persistent};
    this.props.dispatch(login('Log in...'));

    API.call('POST', '/v0/login', body)
      .then(body => {
        this.props.dispatch(loginSuccess(body.username, body.message));
      })
      .catch(err => {
        this.props.dispatch(loginError(err.toString()));
      });
  }

  togglePersistent() {
    this.setState(state => ({ persistent: !state.persistent }));
  }

  render() {
    return (
      <div id="login-dialog">
        <Card style={{ width: '380px' }}>
          <CardHeader>Login to Zackig</CardHeader>
          {!this.props.isLoggingIn && this.renderCardBody()}
          {this.props.note && <CardFooter>{this.props.note}</CardFooter>}
        </Card>
      </div>
    );
  }

  renderCardBody() {
    return (
      <CardBody>
        <Form>
          <FormGroup>
            <label htmlFor="#username">Username</label>
            <FormInput id="username" placeholder="Username" />
          </FormGroup>
          <FormGroup>
            <label htmlFor="#password">Password</label>
            <FormInput type="password" id="password" placeholder="Password" />
          </FormGroup>
          <FormCheckbox
            onChange={this.togglePersistent.bind(this)}
            checked={this.state.persistent}>Keep me logged in</FormCheckbox>
          <div style={{height: '12px'}} />
          <Button theme="primary" onClick={this.logIn.bind(this)} type="submit">Log In</Button>
          <Button theme="secondary"
            style={{ float: 'right' }}
            onClick={this.register.bind(this)}>Register New Account</Button>
        </Form>
      </CardBody>);
  }

}


const stateToProps = state => state.login;
export default connect(stateToProps)(Login);