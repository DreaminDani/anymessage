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
import {
  withStyles, Typography, Grid, Button,
} from '@material-ui/core';

const styles = theme => ({
  active: {
    width: '100%',
    color: theme.palette.primary.light,
  },
  inactive: {
    width: '100%',
    paddingTop: 8,
    paddingBottom: 8,
  },
});

class UserMenuItem extends React.Component {
  onClickHandler = () => {
    const { link } = this.props;
    Router.push(link);
  }

  render() {
    const { classes, title, active } = this.props;
    return (
      <Button onClick={this.onClickHandler} className={active ? classes.active : classes.inactive}>
        {title}
      </Button>
    );
  }
}

UserMenuItem.defaultProps = {
  active: false,
};

UserMenuItem.propTypes = {
  classes: PropTypes.object.isRequired,
  active: PropTypes.bool,
  title: PropTypes.string.isRequired,
};

export default withStyles(styles)(UserMenuItem);
