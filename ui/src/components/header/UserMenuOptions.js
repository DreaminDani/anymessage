/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { withStyles, Button, Grid } from '@material-ui/core';
import { ChevronRight, Settings } from '@material-ui/icons';
import UserNameGroup from '../UserNameGroup';
import UserMenuItem from './UserMenuItem';
import { withAuth } from '../../util';

const styles = {
  root: {
    width: 300,
    marginTop: 12,
  },
  collapseIcon: {
    position: 'absolute',
    right: 12,
  },
  userMenu: {
    cursor: 'pointer',
    marginBottom: 16,
  },
  menuItem: {
    width: '100%',
  },
};

class UserMenuOptions extends React.Component {
  isCurrentPage = (option) => {
    const { currentPage } = this.props;
    return currentPage === option;
  }

  render() {
    const {
      classes, authLink, closeLink, user,
    } = this.props;
    return (
      <Grid
        container
        justify="flex-start"
        alignItems="stretch"
        className={classes.root}
      >
        <Grid
          item
          xs={12}
          tabIndex={0}
          role="button"
          className={classes.userMenu}
          onClick={closeLink}
          onKeyDown={closeLink}
        >
          <UserNameGroup
            user={user}
            rightIcon={<ChevronRight className={classes.collapseIcon} />}
          />
        </Grid>
        <UserMenuItem className={classes.menuItem} title="Settings" link="/settings" active={this.isCurrentPage('settings')} />
        <Button className={classes.menuItem} href="https://docs.anymessage.io" target="_blank">Support &amp; Docs</Button>
        <Button className={classes.menuItem} onClick={authLink}>Logout</Button>
      </Grid>
    );
  }
}

UserMenuOptions.defaultProps = {
  user: null,
  currentPage: null,
};

UserMenuOptions.propTypes = {
  classes: PropTypes.object.isRequired,
  authLink: PropTypes.func.isRequired,
  closeLink: PropTypes.func.isRequired,
  currentPage: PropTypes.string,
  user: PropTypes.object,
};

export default withAuth(withStyles(styles)(UserMenuOptions));
