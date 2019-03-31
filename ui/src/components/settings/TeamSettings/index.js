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
import { withStyles, Grid } from '@material-ui/core';

import TeamURL from './TeamURL';
import SubscriptionForm from './SubscriptionForm';
import TeamMembers from './TeamMembers';

const { publicRuntimeConfig } = getConfig();
const { STRIPE_PUBLICKEY } = publicRuntimeConfig;

const styles = {
  billingInfo: {
    width: '100%',
    maxWidth: 600,
  },
};

class TeamSettings extends React.Component {
  state = {
    stripe: null,
  }

  componentDidMount = () => {
    if (STRIPE_PUBLICKEY) {
      this.setState({
        stripe: window.Stripe(STRIPE_PUBLICKEY),
      });
    }
  }

  render() {
    const {
      classes,
      registerSubmitHandler,
      handleChanged,
      handleUnchanged,
      handleError,
    } = this.props;
    const { stripe } = this.state;
    return (
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
      >
        <Grid item sm={12} md={6}>
          <TeamMembers />
          <TeamURL
            submitHandler={registerSubmitHandler}
            handleChanged={handleChanged}
            handleUnchanged={handleUnchanged}
          />
        </Grid>
        <Grid item sm={12} md={6}>
          {stripe && (
            // only render client-side when stripe is in use
            <div className={classes.billingInfo}>
              <StripeProvider stripe={stripe}>
                <Elements>
                  <SubscriptionForm
                    fieldID={2}
                    submitHandler={registerSubmitHandler}
                    handleChanged={handleChanged}
                    handleUnchanged={handleUnchanged}
                    handleError={handleError}
                  />
                </Elements>
              </StripeProvider>
            </div>
          )}
        </Grid>


      </Grid>
    );
  }
}

export default withStyles(styles)(TeamSettings);
