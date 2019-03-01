import React from 'react';
import PropTypes from 'prop-types';
import {
  injectStripe, CardNumberElement, CardExpiryElement, CardCVCElement,
} from 'react-stripe-elements';
import { Grid, Typography, Button } from '@material-ui/core';
import { post, get, withAuth } from '../../util';

import StripeElementWrapper from './Stripe/StripeElementWrapper';

const internalFields = new Set([
  'Card Number',
  'Expiry (MM / YY)',
  'CVC',
]);

const isSetsEqual = (a, b) => a.size === b.size && [...a].every(value => b.has(value));

class SubscriptionForm extends React.Component {
  state = {
    changedSettings: new Set(),
    currentErrors: new Set(),
    cus_id: null,
    last4: null,
    expiry: null,
    disabled: true,
  };

  componentDidMount = async () => {
    const { submitHandler, user, fieldID } = this.props;
    submitHandler(fieldID, this.submit.bind(this));

    const subscriptionDetails = await get('/team/subscription', user.id_token);
    if (subscriptionDetails.customer) {
      this.setState({
        cus_id: subscriptionDetails.customer,
        last4: subscriptionDetails.last4,
        expiry: `${subscriptionDetails.exp_month} / ${subscriptionDetails.exp_year}`,
        disabled: true,
      });
    } else {
      this.setState({
        disabled: false,
      });
    }
  }


  submit = async (ev) => {
    const { user, stripe } = this.props;
    const { cus_id } = this.state;
    const { token } = await stripe.createToken({ user });
    const response = await post('/team/subscription', user.id_token, {
      cus_id,
      token: token.id,
      team_url: user.teamURL,
    });

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

  handleEdit = () => {
    this.setState({ disabled: false });
  }

  render() {
    const {
      disabled, cus_id, last4, expiry,
    } = this.state;
    return (
      <React.Fragment>
        <Typography>AnyMessage.io is a hosted version of AnyMessage that costs $15/month/user. You can provide credit card information for your team, below.</Typography>
        {disabled && cus_id && <Button color="primary" onClick={this.handleEdit}>Edit Billing Information</Button>}
        <Grid container>
          <Grid item xs={12}>
            <StripeElementWrapper
              label={(disabled && last4) ? `•••• •••• •••• ${last4}` : 'Card Number'}
              handleChanged={this.internalChangeHandler}
              handleUnchanged={this.internalUnchangeHandler}
              handleError={this.internalErrorHandler}
              component={CardNumberElement}
              disabled={disabled}
            />
          </Grid>
          <Grid item xs={7}>
            <StripeElementWrapper
              label={(disabled && last4) ? `Expires on ${expiry}` : 'Expiry (MM / YY)'}
              handleChanged={this.internalChangeHandler}
              handleUnchanged={this.internalUnchangeHandler}
              handleError={this.internalErrorHandler}
              component={CardExpiryElement}
              disabled
            />
          </Grid>
          <Grid item xs={5}>
            <StripeElementWrapper
              label="CVC"
              handleChanged={this.internalChangeHandler}
              handleUnchanged={this.internalUnchangeHandler}
              handleError={this.internalErrorHandler}
              component={CardCVCElement}
              disabled
            />
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

SubscriptionForm.defaultProps = {
  user: null,
  fieldID: 'subscriptionForm',
  handleChanged: (fieldID) => { },
  handleUnchanged: (fieldID) => { }, // unused
  handleError: (fieldID) => { },
};

SubscriptionForm.propTypes = {
  submitHandler: PropTypes.func.isRequired,
  fieldID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  handleChanged: PropTypes.func,
  handleUnchanged: PropTypes.func,
  handleError: PropTypes.func,
  user: PropTypes.object,
};

export default withAuth(injectStripe(SubscriptionForm));
