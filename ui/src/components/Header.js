/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import React from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import IconButton from '@material-ui/core/IconButton';
import CommentIcon from '@material-ui/icons/Comment';
import { withAuth } from '../util/authContext';

import UserMenu from './header/UserMenu';

const styles = theme => ({
  root: {
    flexGrow: 1,
    height: theme.header.height,
    zIndex: theme.zIndex.drawer + 1,
    paddingLeft: 16,
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    [theme.breakpoints.up('md')]: {
      visibility: 'hidden',
    },
    marginLeft: -12,
    marginRight: 12,
  },
});

const tabs = [
  { name: 'messages', path: '/messages' },
  { name: 'settings', path: '/settings' },
];

function getRoute(routeName) {
  return tabs.find(tabRoute => tabRoute.name === routeName);
}

class Header extends React.Component {
  getTab = () => {
    const { currentPage } = this.props;
    const index = tabs.indexOf(getRoute(currentPage));
    return (index > -1) ? index : false;
  }

  handleTabClick = (event, value) => {
    const { user } = this.props;
    const { teamURL } = user;
    const route = tabs[value];

    if (teamURL === window.location.hostname) {
      Router.push(route.path);
    } else {
      window.location = `//${teamURL}${route.path}`;
    }
  }

  render() {
    const {
      classes, user, onMenuClick,
    } = this.props;

    const currentTab = this.getTab();
    return (
      <AppBar position="static" className={classes.root}>
        <Toolbar style={onMenuClick ? null : { marginLeft: 48 }} disableGutters>
          {onMenuClick // only render menu icon if there's a click to go with it
                    && (
                      <IconButton
                        className={classes.menuButton}
                        color="inherit"
                        aria-label="Menu"
                        onClick={onMenuClick}
                      >
                        <CommentIcon />
                      </IconButton>
                    )
          }
          {user // only show tabs if user is logged in
          && (
          <Tabs className={classes.grow} value={currentTab} onChange={this.handleTabClick}>
            {tabs.map(route => <Tab key={route.name} label={route.name} />)}
          </Tabs>
          )}
          <UserMenu />
        </Toolbar>
      </AppBar>
    );
  }
}

Header.defaultProps = {
  width: 'sm',
  currentPage: '',
  user: null,
  onMenuClick: null,
};

Header.propTypes = {
  classes: PropTypes.object.isRequired,
  width: PropTypes.string,
  currentPage: PropTypes.string,
  user: PropTypes.object,
  onMenuClick: PropTypes.func,
};

export default withAuth(withStyles(styles)(Header));
