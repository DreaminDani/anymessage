/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
/* eslint-disable jsx-a11y/anchor-is-valid */

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Head from 'next/head';
import Router from 'next/router';
import getConfig from 'next/config';
import { Typography } from '@material-ui/core';
import Header from '../src/components/Header';
import CustomIndex from '../customization/index';
import AuthService from '../src/util/AuthService';

// marketing content
import Hero from '../src/components/marketing/Hero';

const { publicRuntimeConfig } = getConfig();
const { UI_HOSTNAME } = publicRuntimeConfig;

const styles = theme => ({
  center: { textAlign: 'center' },
});

class Index extends React.Component {
  componentDidMount = () => {
    this.auth = new AuthService();

    // check if accessing subdomain
    const subdomain = window.location.hostname.split('.')[0];
    if (subdomain !== 'www' && subdomain !== UI_HOSTNAME.split('.')[0]) {
      // if authenticated, redirect to messages
      if (this.auth.loggedIn()) {
        Router.push('/messages');
      } else {
        // if not authed, redirect to login for auto-login loop
        window.location = `http://www.${UI_HOSTNAME}?unauthed`;
      }
    }

    // check if redirect to unauthed
    if (window.location.search === '?unauthed') {
      this.auth.login();
    }
  }

  render() {
    const { classes } = this.props;
    const hasCustomized = CustomIndex(this.props);
    return (
      <div className={classes.root}>
        <Head>
          <title>AnyMessage.io</title>
        </Head>
        <Header />
        {hasCustomized ? <CustomIndex {...this.props} /> : (
          <React.Fragment>
            <Hero />
            <div className={classes.center}>
              <Typography variant="h1">
              Coming Soon
              </Typography>
              <Typography variant="body1">
                <a href="mailto:daniel@anymessage.io">More Info</a>
              </Typography>
            </div>
          </React.Fragment>
        )}
      </div>
    );
  }
}

Index.defaultProps = {
  user: null,
};

Index.propTypes = {
  classes: PropTypes.object.isRequired,
  user: PropTypes.object,
};

export default withStyles(styles)(Index);
