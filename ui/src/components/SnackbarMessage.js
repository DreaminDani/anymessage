/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Snackbar, withStyles } from '@material-ui/core';

const styles = theme => ({
  snackbar: {
    margin: theme.spacing.unit,
  },
});

function SnackbarMessage(props) {
  const {
    classes, message, buttonText, buttonLink, handleClose, hideAfter,
  } = props;

  let action;
  if (buttonText && buttonLink) {
    action = (
      <a href={buttonLink}>
        <Button color="secondary" size="small">
          {buttonText}
        </Button>
      </a>
    );
  }

  return (
    <div>
      <Snackbar
        className={classes.snackbar}
        open={typeof message !== 'undefined'}
        autoHideDuration={hideAfter}
        onClose={handleClose}
        ContentProps={{
          'aria-describedby': 'message-id',
        }}
        message={message}
        action={action}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
    </div>
  );
}

SnackbarMessage.defaultProps = {
  buttonText: null,
  buttonLink: null,
  handleClose: null,
  hideAfter: 3000,
};

SnackbarMessage.propTypes = {
  classes: PropTypes.object.isRequired,
  message: PropTypes.string.isRequired,
  buttonText: PropTypes.string,
  buttonLink: PropTypes.string,
  handleClose: PropTypes.func,
  hideAfter: PropTypes.number,
};

export default withStyles(styles)(SnackbarMessage);
