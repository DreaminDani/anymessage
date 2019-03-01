/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Typography, withStyles } from '@material-ui/core';
import TwilioSettings from '../settings/TwilioSettings';

const styles = {
  description: {
    marginBottom: 24,
  },
  featureRequest: {
    marginTop: 40,
  },
};

class SetupIntegrations extends React.Component {
  constructor(props) {
    super(props);
    this.save = [];
  }

  componentDidMount = () => {
    const { registerSubmitHandler } = this.props;
    registerSubmitHandler(1, this.submit.bind(this));
  }

  submit = async () => {
    Object.keys(this.save).forEach((key) => {
      this.save[key]();
    }, this.save);
  }

  internalSubmitHandler = (fieldID, submitHandler) => {
    this.save[fieldID] = submitHandler;
  }

  handleChanged = (fieldID) => {
    const { setValid } = this.props;
    setValid(true);
  }

  handleUnchanged = (fieldID) => {
    const { setValid } = this.props;
    setValid(true);
  }

  render() {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <Typography variant="subtitle1" className={classes.description}>
          AnyMessage works by sending messages through a number of integrations.
          You can set these up now and update them at any time your Team's Settings.
        </Typography>
        <TwilioSettings
          submitHandler={this.internalSubmitHandler}
          handleChanged={this.handleChanged}
          handleUnchanged={this.handleUnchanged}
        />
        <Typography variant="body1" className={classes.featureRequest}>
          Is your favorite messaging provider not listed?
          {' '}
          <a href="https://docs.anymessage.io/roadmap/" target="_blank" rel="noopener noreferrer">
            Check out the roadmap or submit a feature request!
          </a>
        </Typography>
      </React.Fragment>
    );
  }
}

SetupIntegrations.defaultProps = {
  setValid: (boolean) => { },
};

SetupIntegrations.propTypes = {
  classes: PropTypes.object.isRequired,
  registerSubmitHandler: PropTypes.func.isRequired,
  setValid: PropTypes.func,
};

export default withStyles(styles)(SetupIntegrations);
