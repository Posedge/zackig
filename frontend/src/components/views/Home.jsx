import React from 'react';
import { connect } from 'react-redux';
import {
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  InputGroup,
  FormInput,
  Collapse,
  Alert,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle
} from 'shards-react';

import Dashboard from './Dashboard';
import API from '../../service/Api';
import { logout, logoutSuccess, logoutError, filterViewByTag } from '../../store';
import { getTagColor } from './noteoverlay/NoteTagBadge';


class Home extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      collapseOpen: false,
      tagDropdownOpen: false
    };
  }

  toggleNavbar() {
    this.setState(prevState => ({
      ...prevState,
      collapseOpen: !prevState.collapseOpen
    }));
  }

  toggleTagDropdownOpen() {
    this.setState(prevState => ({
      ...prevState,
      tagDropdownOpen: !prevState.tagDropdownOpen
    }));
  }

  logOut() {
    this.props.dispatch(logout());
    API.call('POST', '/v0/logout')
      .then(() => this.props.dispatch(logoutSuccess()))
      .catch(err => this.props.dispatch(logoutError(err)));
  }

  filterByTag(tag) {
    this.props.dispatch(filterViewByTag(tag));
  }

  renderTagSelector() {
    const notes = this.props.notes || [];
    const allTags = notes.map(note => note.tags).flat();
    // filter duplicates and sort
    const tagList = [...new Set(allTags)].sort();
    const selectorTitle = this.props.view.filterByTag || 'Select Tag';
    return (
      <Dropdown inNavbar nav outline open={this.state.tagDropdownOpen} toggle={this.toggleTagDropdownOpen.bind(this)}>
        <DropdownToggle caret theme="dark" >{selectorTitle}</DropdownToggle>
        <DropdownMenu>
          {
            tagList.length === 0
              ? <DropdownItem disabled>(No Tags)</DropdownItem>
              : <DropdownItem
                onClick={() => this.filterByTag(null)}
                active={this.props.view.filterByTag === null}
              >All</DropdownItem>
          }
          {
            tagList.map(tag => <DropdownItem
              onClick={() => this.filterByTag(tag)}
              active={this.props.view.filterByTag === tag}
              style={{backgroundColor: getTagColor(tag)}}
            >{tag}</DropdownItem>)
          }
        </DropdownMenu>
      </Dropdown>
    );
  }

  render() {
    return (
      <>
        <div className="alert-wrapper">
          <Alert
            className="alert-box"
            open={this.props.alert}
            theme={this.props.alert && this.props.alert.theme}>
            {this.props.alert && this.props.alert.message}
          </Alert>
        </div> 
        <Navbar type="dark" theme="dark" expand="md">
          <NavbarBrand href="#">Zackig!!</NavbarBrand>
          <Nav navbar className="mr-auto">
            <NavItem active style={{ color: '#ddd' }}>Welcome, {this.props.username}!</NavItem>
          </Nav>
          <NavbarToggler onClick={this.toggleNavbar.bind(this)} />
          <Collapse open={this.state.collapseOpen} navbar>
            <Nav navbar className="ml-auto">
              <NavItem>
                {this.renderTagSelector()}
              </NavItem>
              <NavItem>
                <NavLink href="#" onClick={this.logOut.bind(this)}>
                  Log out
              </NavLink>
              </NavItem>
            </Nav>
            <Nav navbar>
              <InputGroup size="sm" style={{ marginLeft: '15px' }} seamless>
                <FormInput className="border-0" placeholder="Search..." />
                {/* TODO implement */}
              </InputGroup>
            </Nav>
          </Collapse>
        </Navbar>
        <Dashboard />
      </>
    );
  }
}


const stateToProps = state => ({login: state.login, alert: state.alert, view: state.view, notes: state.notes.notes});
export default connect(stateToProps)(Home);