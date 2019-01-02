/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';

import { withAuth } from '../../util/authContext';

const styles = theme => ({
  loginButton: {
    marginLeft: -12,
  },
});

class TeamURL extends React.Component {
    state = {
      loaded: false,
      anchorEl: null,
    }

    handleLogoutMenuClick = (event) => {
      this.setState({ anchorEl: event.currentTarget });
    };

      handleLogoutMenuClose = () => {
        this.setState({ anchorEl: null });
      };

      render() {
        const { classes, width, user } = this.props;
        const { loaded, anchorEl } = this.state;

        if (user) {
          return (
            // @WIP - todo show user name and dropdown instead of ellipses
            <div className={classes.loginButton}>
              <Button
                color="inherit"
                aria-owns={anchorEl ? 'logout-menu' : undefined}
                aria-haspopup="true"
                onClick={this.handleLogoutMenuClick}
              >
                <MoreVertIcon />
              </Button>
              <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={this.handleLogoutMenuClose}
              >
                <MenuItem onClick={loaded ? this.auth.logout : null}>Logout</MenuItem>
              </Menu>
            </div>
          );
        }
        return <Button className={classes.loginButton} onClick={loaded ? this.auth.login : null} color="inherit">Login</Button>;
      }
}

TeamURL.defaultProps = {
  width: 'sm',
  user: null,
};
TeamURL.propTypes = {
  classes: PropTypes.object.isRequired,
  width: PropTypes.string,
  user: PropTypes.object,
};

export default withAuth(withWidth()(withStyles(styles)(TeamURL)));
