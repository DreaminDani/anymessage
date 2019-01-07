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
import UserNameGroup from './UserNameGroup';
import UserMenuItem from './UserMenuItem';

const styles = theme => ({
  root: {
    width: 300,
    marginTop: 12,
  },
  collapseIcon: {
    cursor: 'pointer',
    position: 'absolute',
    right: 12,
  },
});

class UserMenuOptions extends React.Component {
  render() {
    const { classes, authLink } = this.props;
    return (
      <Grid
        container
        direction="column"
        justify="flex-start"
        alignItems="stretch"
        className={classes.root}
      >
        <Grid item xs={12}>
          <UserNameGroup
            rightIcon={<ChevronRight className={classes.collapseIcon} />}
          />
        </Grid>
        <UserMenuItem title="Settings" link="/settings">
          <Settings />
        </UserMenuItem>
        <Button onClick={authLink}>Logout</Button>
      </Grid>
    );
  }
}

UserMenuOptions.propTypes = {
  classes: PropTypes.object.isRequired,
  authLink: PropTypes.func.isRequired,
};

export default withStyles(styles)(UserMenuOptions);
