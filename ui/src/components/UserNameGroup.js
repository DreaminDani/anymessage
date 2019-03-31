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

const styles = {
  username: {
    marginLeft: 8,
    textTransform: 'none',
    maxWidth: 180,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}; // @todo decide on a bg-color for the initials

class UserNameGroup extends React.Component {
  getInitials = () => {
    const { user } = this.props;
    const {
      given_name, family_name, name, email,
    } = user;
    let initials;
    if (given_name && family_name) {
      initials = given_name.charAt(0) + family_name.charAt(0);
    } else if (name) {
      initials = name.charAt(0);
    } else {
      initials = email.charAt(0);
    }
    return initials.toUpperCase();
  }

  render() {
    const {
      classes, user, rightIcon, justify,
    } = this.props;
    return (
      <Grid
        container
        direction="row"
        justify={justify}
        alignItems="center"
      >

        {user.picture
          ? <Avatar alt={user.name || user.email} src={user.picture} />
          : <Avatar alt={user.name || user.email}>{this.getInitials()}</Avatar>}
        <Typography variant="body2" color="inherit" className={classes.username}>{user.email}</Typography>
        {rightIcon}
      </Grid>
    );
  }
}

UserNameGroup.defaultProps = {
  user: null,
  rightIcon: null,
  justify: 'center',
};
UserNameGroup.propTypes = {
  classes: PropTypes.object.isRequired,
  user: PropTypes.object, // name, email, picture (optional), family_name & given_name req. if picture not provided
  rightIcon: PropTypes.element,
  justify: PropTypes.string,
};

export default withStyles(styles)(UserNameGroup);
