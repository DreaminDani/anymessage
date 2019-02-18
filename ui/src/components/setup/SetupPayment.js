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
import SubscriptionForm from '../settings/SubscriptionForm';

const { publicRuntimeConfig } = getConfig();
const { STRIPE_PUBLICKEY } = publicRuntimeConfig;

class SetupPayment extends React.Component {
  state = {
    hasError: false,
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
    return (
      <StripeProvider apiKey={STRIPE_PUBLICKEY}>
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
}

export default SetupPayment;
