/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import React from 'react';
import PropTypes from 'prop-types';
import {
  AppBar, IconButton, Toolbar, Typography, withStyles,
} from '@material-ui/core';
import CommentIcon from '@material-ui/icons/Comment';
import Router from 'next/router';
import { withAuth } from '../util';

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
      display: 'none',
    },
    marginLeft: -12,
    marginRight: 12,
  },
});

function goToMessages() {
  Router.push('/messages');
}

class Header extends React.Component {
  render() {
    const {
      classes, user, onMenuClick, currentPage, title,
    } = this.props;

    let headerTitle = '';
    if (currentPage) {
      headerTitle = (title) || currentPage.charAt(0).toUpperCase() + currentPage.slice(1);
    }

    if (user) { // remove when we want login to actually appear on the home page
      return (
        <AppBar position="static" className={classes.root}>
          <Toolbar style={onMenuClick ? null : { marginLeft: 48 }} disableGutters>
            <IconButton
              className={classes.menuButton}
              style={(currentPage !== 'messages') ? { display: 'block' } : {}}
              color="inherit"
              aria-label="Menu"
              onClick={onMenuClick}
            >
              {/* TODO make this actually show messages (and # unread) */}
              <CommentIcon />
            </IconButton>
            <Typography variant="h6" color="inherit" className={classes.grow}>
              {headerTitle}
            </Typography>
            {user && <UserMenu currentPage={currentPage} />}
          </Toolbar>
        </AppBar>
      );
    } else {
      return null;
    }
  }
}

Header.defaultProps = {
  user: null,
  onMenuClick: goToMessages,
  currentPage: null,
  title: null,
};

Header.propTypes = {
  classes: PropTypes.object.isRequired,
  user: PropTypes.object,
  onMenuClick: PropTypes.func,
  currentPage: PropTypes.string,
  title: PropTypes.string,
};

export default withAuth(withStyles(styles)(Header));
