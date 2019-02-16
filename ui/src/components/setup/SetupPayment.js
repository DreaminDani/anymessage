import React from 'react';
import getConfig from 'next/config';
import { Elements, StripeProvider } from 'react-stripe-elements';
import CheckoutForm from '../settings/CheckoutForm';

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
          <CheckoutForm
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
