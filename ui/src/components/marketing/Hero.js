/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import React from 'react';
import { withStyles } from '@material-ui/core';
import MobileMarketing from './mobile-marketing';

const styles = theme => ({
  root: {
    backgroundImage: `linear-gradient(${theme.palette.primary.main}, ${theme.palette.background.default})`,
    height: 600,
  },
});

function Hero(props) {
  const { classes } = props;
  return (
    <div className={classes.root}>
      <MobileMarketing width="100%" height="100%" />
    </div>
  );
}

export default withStyles(styles)(Hero);
