/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import React from 'react';
import PropTypes from 'prop-types';
import Grey from '@material-ui/core/colors/grey';
import { Grid, Typography, withStyles } from '@material-ui/core';

const styles = theme => ({
  root: {
    width: '100%',
  },
  self: {
    backgroundColor: Grey[600],
    marginTop: 8,
    marginRight: 8,
    borderRadius: 10,
    color: '#ffffff',
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 12,
    paddingRight: 12,
  },
  recipient: {
    backgroundColor: theme.palette.primary.light,
    marginTop: 8,
    marginLeft: 8,
    borderRadius: 10,
    color: '#ffffff',
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 12,
    paddingRight: 12,
  },
  timing: {
    paddingTop: 2,
    fontSize: '0.5em',
  },
});

class Message extends React.PureComponent {
  render() {
    const { classes, message } = this.props;
    const recipient = message.who === 0; // 0 is the recipient
    const date = new Date(message.timestamp * 1000);
    const time = date.toTimeString().replace(/ *\([^)]*\) */g, '');
    return (
      <Grid
        container
        className={classes.root}
        direction="row"
        justify={recipient ? 'flex-start' : 'flex-end'}
        alignItems="flex-start"
      >
        <div className={recipient ? classes.recipient : classes.self}>
          <Typography variant="body1" color="inherit">{message.message}</Typography>
          <Typography
            variant="caption"
            color="inherit"
            style={recipient ? { textAlign: 'right' } : { textAlign: 'right' }}
            className={classes.timing}
          >
            {date.toDateString()}
            <br />
            {time}
          </Typography>
        </div>
      </Grid>
    );
  }
}

Message.propTypes = {
  classes: PropTypes.object.isRequired,
  message: PropTypes.object.isRequired,
};

export default withStyles(styles)(Message);
