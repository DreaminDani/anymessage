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

const styles = {
  root: {
    paddingTop: 8,
    paddingBottom: 8,
    textTransform: 'none',
  },
  text: {
    textAlign: 'left',
    marginLeft: 16,
    paddingTop: 2, // adjustment to vertically align text with icon
  },
};

class UserMenuItem extends React.Component {
    onClickHandler = () => {
      const { link } = this.props;
      Router.push(link);
    }

    render() {
      const { classes, title, children } = this.props;
      return (
        <Button onClick={this.onClickHandler} className={classes.root}>
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="flex-start"
          >
            <Grid item xs={1}>
              {children}
            </Grid>
            <Grid item xs={10}>
              <Typography variant="body1" color="inherit" className={classes.text}>{title}</Typography>
            </Grid>

          </Grid>
        </Button>
      );
    }
}

UserMenuItem.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
};

export default withStyles(styles)(UserMenuItem);
