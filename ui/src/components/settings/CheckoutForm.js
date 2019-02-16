import React from 'react';
import PropTypes from 'prop-types';
import {
  injectStripe, CardNumberElement, CardExpiryElement, CardCVCElement,
} from 'react-stripe-elements';
import { Grid, Typography } from '@material-ui/core';
import { post, withAuth } from '../../util';

import StripeElementWrapper from './Stripe/StripeElementWrapper';

const internalFields = new Set([
  'Card Number',
  'Expiry (MM / YY)',
  'CVC',
]);

const isSetsEqual = (a, b) => a.size === b.size && [...a].every(value => b.has(value));

class CheckoutForm extends React.Component {
  state = {
    changedSettings: new Set(),
    currentErrors: new Set(),
  };

  componentDidMount = async () => {
    const { submitHandler, user, fieldID } = this.props;
    submitHandler(fieldID, this.submit.bind(this));

    // TODO get subscription status from API
  }


  submit = async (ev) => {
    const { user, stripe } = this.props;
    const { token } = await stripe.createToken({ user });
    const response = await post('/team/subscription', user.id_token, token);

    if (response.ok) console.log('Purchase Complete!');
  }

  internalChangeHandler = (label) => {
    const { handleChanged, fieldID } = this.props;
    this.setState(({ changedSettings }) => {
      changedSettings.add(label);
      if (isSetsEqual(internalFields, changedSettings)) {
        handleChanged(fieldID);
      }
      return ({
        changedSettings,
      });
    });
  }

  internalUnchangeHandler = (label) => {
    const { handleUnchanged, fieldID } = this.props;
    this.setState(({ changedSettings }) => {
      handleUnchanged(fieldID);
      changedSettings.delete(label);
      return ({
        changedSettings,
      });
    });
  }

  internalErrorHandler = (fieldID, hasError) => {
    const { handleError } = this.props;
    if (hasError) {
      this.setState(({ currentErrors }) => {
        if (currentErrors.size === 0) {
          handleError(true);
        }
        currentErrors.add(fieldID);
        return ({
          currentErrors,
        });
      });
    } else {
      this.setState(({ currentErrors }) => {
        currentErrors.delete(fieldID);
        if (currentErrors.size === 0) {
          handleError(false);
        }
        return ({
          currentErrors,
        });
      });
    }
  }

  render() {
    return (
      <React.Fragment>
        <Typography>AnyMessage.io is a hosted version of AnyMessage that costs $5/month/user. You can provide credit card information for your team, below.</Typography>
        <Grid container>
          <Grid item xs={12}>
            <StripeElementWrapper
              label="Card Number"
              handleChanged={this.internalChangeHandler}
              handleUnchanged={this.internalUnchangeHandler}
              handleError={this.internalErrorHandler}
              component={CardNumberElement}
            />
          </Grid>
          <Grid item xs={7}>
            <StripeElementWrapper
              label="Expiry (MM / YY)"
              handleChanged={this.internalChangeHandler}
              handleUnchanged={this.internalUnchangeHandler}
              handleError={this.internalErrorHandler}
              component={CardExpiryElement}
            />
          </Grid>
          <Grid item xs={5}>
            <StripeElementWrapper
              label="CVC"
              handleChanged={this.internalChangeHandler}
              handleUnchanged={this.internalUnchangeHandler}
              handleError={this.internalErrorHandler}
              component={CardCVCElement}
            />
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

CheckoutForm.defaultProps = {
  user: null,
  fieldID: 'checkoutForm',
  handleChanged: (fieldID) => { },
  handleUnchanged: (fieldID) => { }, // unused
  handleError: (fieldID) => { },
};

CheckoutForm.propTypes = {
  submitHandler: PropTypes.func.isRequired,
  fieldID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  handleChanged: PropTypes.func,
  handleUnchanged: PropTypes.func,
  handleError: PropTypes.func,
  user: PropTypes.object,
};

export default withAuth(injectStripe(CheckoutForm));
