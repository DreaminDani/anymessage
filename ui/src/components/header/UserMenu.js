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
  Button, Drawer, withWidth, withStyles,
} from '@material-ui/core';
// import Menu from '@material-ui/core/Menu';
// import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import { withAuth } from '../../util/authContext';
import AuthService from '../../util/AuthService';

import UserNameGroup from './UserNameGroup';

const styles = theme => ({
  loginButton: {
    marginLeft: -12,
  },
});

class UserMenu extends React.Component {
    state = {
      loaded: false,
      open: false,
    }

    componentDidMount() {
      this.auth = new AuthService();
      this.setState({ loaded: true });
    }

    handleMenuClick = () => {
      this.setState({ open: true });
    };

    handleMenuClose = () => {
      this.setState({ open: false });
    };

    render() {
      const { classes, width, user } = this.props;
      const { loaded, open } = this.state;

      if (user) {
        return (
          // @WIP - todo show user name and dropdown instead of ellipses
          <div className={classes.loginButton}>
            <Button
              color="inherit"
              aria-haspopup="true"
              onClick={this.handleMenuClick}
            >
              <UserNameGroup />
            </Button>
            <Drawer anchor="right" open={open} onClose={this.handleMenuClose}>
              <div
                tabIndex={0}
                role="button"
                onClick={this.handleMenuClose}
                onKeyDown={this.handleMenuClose}
              >
                <Button onClick={loaded ? this.auth.logout : null}>Logout</Button>
              </div>
            </Drawer>
          </div>
        );
      }
      return <Button className={classes.loginButton} onClick={loaded ? this.auth.login : null} color="inherit">Login</Button>;
    }
}

UserMenu.defaultProps = {
  width: 'sm',
  user: null,
};
UserMenu.propTypes = {
  classes: PropTypes.object.isRequired,
  width: PropTypes.string,
  user: PropTypes.object,
};

export default withAuth(withWidth()(withStyles(styles)(UserMenu)));
