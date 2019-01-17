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
  withStyles, Typography, Button, Grid, Collapse,
} from '@material-ui/core';

const fieldID = 'teamURL';

const styles = theme => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.warning.main,
    padding: 8,
  },
  button: {
    marginLeft: 16,
    backgroundColor: theme.palette.success.main,
    color: '#ffffff',
    '&:hover': {
      backgroundColor: theme.palette.success.dark,
    },
  },
});

class UnsavedBar extends React.Component {
  render() {
    const {
      classes, isUnsaved, saveClick, discardClick,
    } = this.props;
    return (
      <Collapse in={isUnsaved}>
        <Grid
          container
          direction="row"
          justify="center"
          alignItems="center"
          className={classes.root}
        >
          <Typography variant="subtitle1">
            You have unsaved changes
          </Typography>
          <Button
            variant="contained"
            color="inherit"
            className={classes.button}
            onClick={saveClick}
          >
                Save Changes
          </Button>
        </Grid>
      </Collapse>
    );
  }
}

UnsavedBar.propTypes = {
  isUnsaved: PropTypes.bool.isRequired,
  saveClick: PropTypes.func.isRequired,
  discardClick: PropTypes.func.isRequired,
};

export default withStyles(styles)(UnsavedBar);
