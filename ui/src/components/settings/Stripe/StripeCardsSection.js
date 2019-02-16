/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 *
 * This file extends from the example at https://gist.github.com/lfalke/1c5e7168424c8b2a65dcfba425fcc310
 */
import React, { PureComponent } from 'react';

import Grid from '@material-ui/core/Grid';
import { CardNumberElement, CardExpiryElement, CardCVCElement } from 'react-stripe-elements';

import StripeElementWrapper from './StripeElementWrapper';

export default class extends PureComponent {
    static displayName = 'StripeCardsSection'

    render() {
      return (
          <Grid container>
              <Grid item xs={12}>
                  <StripeElementWrapper label="Card Number" component={CardNumberElement} />
                </Grid>
              <Grid item xs={7}>
                  <StripeElementWrapper label="Expiry (MM / YY)" component={CardExpiryElement} />
                </Grid>
              <Grid item xs={5}>
                  <StripeElementWrapper label="CVC" component={CardCVCElement} />
                </Grid>
            </Grid>
      );
    }
}
