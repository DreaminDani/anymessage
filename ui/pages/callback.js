/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, CircularProgress, Snackbar, withStyles } from '@material-ui/core';
import Router from 'next/router';
import { AuthService, get } from '../src/util';

const styles = {
  progress: {
    width: 300,
    height: 300,
    position: 'absolute',
    top: '50%',
    left: '50%',
  },
};

class Callback extends React.Component {
  state = {
    failed: false,
  }

  componentDidMount() {
    if (window.location.hash) {
      this.auth = new AuthService();
      this.auth.parseHash((loggedIn) => {
        if (loggedIn) {
          this.logIntoAPI();
        } else {
          this.setState({ failed: true });
        }
      });
    } else {
      Router.push('/');
    }
  }

  logIntoAPI = () => {
    // call login to get/create user in DB
    const user = this.auth.getToken();
    if (user) {
      get('/user/login', user.id_token)
        .then((data) => {
          // redirect user after login
          if (data.teamURL) {
            this.auth.setTeamURL(data.teamURL);
          }
          if (data.redirectURI) {
            if (data.redirectURI.startsWith('/')) {
              Router.push(data.redirectURI);
            } else {
              window.location = data.redirectURI;
            }
          } else {
            this.setState({ failed: true });
          }
        })
        .catch(err => console.log(err));
    } else {
      this.setState({ failed: true });
    }
  }

  render() {
    const { classes } = this.props;
    const { failed } = this.state;

    if (!failed) {
      return <CircularProgress className={classes.progress} />;
    }

    const retry = (
      <Button color="secondary" size="small" onClick={this.auth.login}>
        Retry
      </Button>
    );

    return (
      <Snackbar
        action={retry}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open
        ContentProps={{
          'aria-describedby': 'message-id',
        }}
        message="There was a problem logging you in. Please try again."
      />
    );
  }
}

Callback.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Callback);
