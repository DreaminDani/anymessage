/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-indent-props */
import React from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';
import {
  withStyles, Stepper, Step, StepLabel, Button, Typography, Divider, LinearProgress,
} from '@material-ui/core';
import Head from 'next/head';

import Header from '../src/components/Header';

import { SetupTeamURL, SetupIntegrations, SetupPayment } from '../src/components/setup';
import { urlSearchData } from '../src/util';

const styles = {
  container: {
    marginTop: 40,
    paddingLeft: 40,
    paddingRight: 40,
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: 1400,
  },
  divider: {
    marginBottom: 16,
  },
  nextHeading: {
    marginTop: 32,
  },
  actions: {
    marginTop: 40,
  },
  nextButtons: {
    float: 'right',
    marginRight: 40,
  },
  stepper: {
    backgroundColor: 'unset',
  },
};

function getSteps() {
  return ['Choose Team URL', 'Configure Integrations', 'Set up Subscription'];
}

class Setup extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      activeStep: 0,
      skipped: new Set(),
      isValid: false,
    };

    this.save = [];
  }

  // redirect unauthed user to "/"
  componentDidMount = () => {
    const { user } = this.props;
    if (!user) {
      Router.push('/?needsauth');
      return false;
    }
    let initialStep = 0;
    if (window.location.hash) {
      const query = urlSearchData(window.location.hash);
      if (query.step) {
        initialStep = parseInt(query.step);
      }
    }
    this.setState({
      activeStep: initialStep,
      loading: false,
    });
  }

  getStepContent(step) {
    switch (step) {
      case 0:
        return <SetupTeamURL registerSubmitHandler={this.registerSubmitHandler} setValid={this.setValid} />;
      case 1:
        return <SetupIntegrations registerSubmitHandler={this.registerSubmitHandler} setValid={this.setValid} />;
      case 2:
        return <SetupPayment registerSubmitHandler={this.registerSubmitHandler} setValid={this.setValid} />;
      default:
        return (
          <Typography variant="h5">
            Not sure how you got here! Head back to
            {' '}
            {<a href="/setup">/setup</a>}
            {' '}
            to complete the setup process...
          </Typography>
        );
    }
  }

  isStepOptional = step => step !== 0; // only TeamURL is required

  registerSubmitHandler = (fieldID, submitHandler) => {
    this.save[fieldID] = submitHandler;
  }

  setValid = (value) => {
    this.setState({ isValid: value });
  }

  handleNext = async () => {
    const { activeStep } = this.state;
    let { skipped } = this.state;
    if (this.isStepSkipped(activeStep)) {
      skipped = new Set(skipped.values());
      skipped.delete(activeStep);
    } else if (this.save[activeStep]) {
      try {
        await this.save[activeStep](); // TODO catch this and prevent advance on fail
      } catch (e) {
        console.error(e); // todo pretty error
      }
    }

    // navigate to next step
    if (activeStep < 2) {
      window.location.hash = `step=${activeStep + 1}`;
      this.setState({
        activeStep: activeStep + 1,
        skipped,
        isValid: false,
      });
    } else {
      // if done with setup, navigate to messages
      window.location = '/messages';
    }
  };

  handleBack = () => {
    const { activeStep } = this.state;
    window.location.hash = `step=${activeStep - 1}`;
    this.setState(state => ({
      activeStep: activeStep - 1,
    }));
  };

  handleSkip = () => {
    const { activeStep } = this.state;
    if (!this.isStepOptional(activeStep)) {
      // this should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    // navigate to next step
    if (activeStep < 2) {
      window.location.hash = `step=${activeStep + 1}`;
      this.setState((state) => {
        const skipped = new Set(state.skipped.values());
        skipped.add(activeStep);
        return {
          activeStep: state.activeStep + 1,
          skipped,
        };
      });
    } else {
      // if done with setup, navigate to messages
      window.location = '/messages';
    }
  };

  isStepSkipped(step) {
    const { skipped } = this.state;
    return skipped.has(step);
  }

  render() {
    const { classes } = this.props;
    const steps = getSteps();
    const { activeStep, loading, isValid } = this.state;
    return (
      <React.Fragment>
        <Head>
          <title>Setup</title>
          <script src="https://js.stripe.com/v3/" />
        </Head>
        <Header currentPage="setup" />
        <div className={classes.container}>
          <Typography variant="h3" gutterBottom>
            Welcome to AnyMessage!
          </Typography>
          <Divider className={classes.divider} />
          {(loading) ? <LinearProgress />
            : (
              <React.Fragment>
                <Stepper activeStep={activeStep} classes={{ root: classes.stepper }}>
                  {steps.map((label, index) => {
                    const props = {};
                    const labelProps = {};
                    if (this.isStepOptional(index)) {
                      labelProps.optional = <Typography variant="caption">Optional</Typography>;
                    }
                    if (this.isStepSkipped(index)) {
                      props.completed = false;
                    }
                    return (
                      <Step key={label} {...props}>
                        <StepLabel {...labelProps}>{label}</StepLabel>
                      </Step>
                    );
                  })}
                </Stepper>
                <div>
                  {this.getStepContent(activeStep)}
                  <div className={classes.actions}>
                    <Button
                      variant="contained"
                      color="secondary"
                      disabled={activeStep === 0}
                      onClick={this.handleBack}
                      className={classes.button}
                    >
                      Back
                    </Button>
                    <span className={classes.nextButtons}>
                      {this.isStepOptional(activeStep) && (
                        <Button
                          onClick={this.handleSkip}
                          className={classes.button}
                        >
                          Skip
                        </Button>
                      )}
                      <Button
                        variant="contained"
                        color="primary"
                        disabled={!isValid}
                        onClick={this.handleNext}
                        className={classes.button}
                      >
                        {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                      </Button>
                    </span>
                  </div>
                </div>
              </React.Fragment>
            )}
        </div>
      </React.Fragment>
    );
  }
}

Setup.defaultProps = {
  user: null,
};

Setup.propTypes = {
  classes: PropTypes.object.isRequired,
  user: PropTypes.object,
};

export default withStyles(styles)(Setup);
