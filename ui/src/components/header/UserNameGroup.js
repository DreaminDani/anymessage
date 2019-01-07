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
  withStyles, Avatar, Typography, Grid,
} from '@material-ui/core';

import { withAuth } from '../../util/authContext';

const styles = {
  username: {
    marginLeft: 8,
    textTransform: 'none',
  },
}; // @todo decide on a bg-color for the initials

class UserNameGroup extends React.Component {
    getInitials = () => {
      const { user } = this.props;
      const { given_name, family_name } = user;
      const initials = given_name.charAt(0) + family_name.charAt(0);
      return initials.toUpperCase();
    }

    render() {
      const { classes, user, rightIcon } = this.props;
      return (
        <Grid
          container
          direction="row"
          justify="center"
          alignItems="center"
        >

          {user.picture
            ? <Avatar alt={user.name} src={user.picture} />
            : <Avatar alt={user.name}>{this.getInitials()}</Avatar>}
          <Typography variant="body2" color="inherit" className={classes.username}>{user.email}</Typography>
          {rightIcon}
        </Grid>
      );
    }
}

UserNameGroup.defaultProps = {
  user: null,
  rightIcon: null,
};
UserNameGroup.propTypes = {
  classes: PropTypes.object.isRequired,
  user: PropTypes.object,
  rightIcon: PropTypes.element,
};

export default withAuth(withStyles(styles)(UserNameGroup));
