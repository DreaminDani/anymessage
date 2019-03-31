/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */

import React from 'react';
import getConfig from 'next/config';
import { Elements, StripeProvider } from 'react-stripe-elements';
import { Typography } from '@material-ui/core';
import SubscriptionForm from '../settings/TeamSettings/SubscriptionForm';

const { publicRuntimeConfig } = getConfig();
const { STRIPE_PUBLICKEY } = publicRuntimeConfig;

class SetupPayment extends React.Component {
  state = {
    hasError: false,
    stripe: null,
  }

  componentDidMount() {
    // Create Stripe instance in componentDidMount
    // (componentDidMount only fires in browser/DOM environment)
    this.setState({ stripe: window.Stripe(STRIPE_PUBLICKEY) });
  }

  handleChanged = (fieldID) => {
    const { setValid } = this.props;
    const { hasError } = this.state;
    if (!hasError) {
      setValid(true);
    }
  }

  handleUnchanged = (fieldID) => {
    const { setValid } = this.props;
    setValid(false);
  }

  handleError = (hasError) => {
    const { setValid } = this.props;
    this.setState({
      hasError,
    });
    setValid(false);
  }

  render() {
    const { registerSubmitHandler } = this.props;
    const { stripe } = this.state;
    if (STRIPE_PUBLICKEY) {
      return (
        <StripeProvider stripe={stripe}>
          <Elements>
            <SubscriptionForm
              fieldID={2}
              submitHandler={registerSubmitHandler}
              handleChanged={this.handleChanged}
              handleUnchanged={this.handleUnchanged}
              handleError={this.handleError}
            />
          </Elements>
        </StripeProvider>
      );
    }
    return (
      <React.Fragment>
        <Typography variant="h5">
          You are using a self-hosted version of AnyMessage.io. No payment is necessary to access all features.
        </Typography>
      </React.Fragment>
    );
  }
}

export default SetupPayment;
