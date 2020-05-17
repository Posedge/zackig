import React from 'react';
import { connect } from 'react-redux';

import Login from './components/views/Login';
import Home from './components/views/Home';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'shards-ui/dist/css/shards.min.css';

class App extends React.Component {

  render() {
    if (this.props.login.username === null) {
      return <Login />;
    } else {
      return <Home 
        username={this.props.login.username}
        login={this.props.login}
      />;
    }
  }

};

const stateToProps = state => ({login: state.login});
App = connect(stateToProps)(App);
export default App;