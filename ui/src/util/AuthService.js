/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
/* eslint-disable class-methods-use-this */
import auth0 from 'auth0-js';
import Cookie from 'js-cookie';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();
const { AUTH0_CLIENTID, AUTH0_DOMAIN, UI_HOSTNAME } = publicRuntimeConfig;

export default class AuthService {
  constructor() {
    // Configure Auth0
    this.clientId = AUTH0_CLIENTID;
    this.domain = AUTH0_DOMAIN;

    this.auth0 = new auth0.WebAuth({
      domain: this.domain,
      clientID: this.clientId,
      scope: 'openid email profile',
      responseType: 'token id_token',
      redirectUri: `http://www.${UI_HOSTNAME}/callback`,
      // if using SSL, all http traffic must be redirected to https
    });
  }

  parseCookie(cookie, needle) {
    const value = `; ${cookie}`;
    const parts = value.split(`; ${needle}=`);
    if (parts.length === 2) {
      return parts.pop().split(';').shift();
    }
    return null;
  }

  parseHash = (callback) => {
    this.auth0.parseHash((err, result) => {
      if (err || !result) {
        callback(false);
        this.logout();
        return;
      }

      this.setToken(result);
      callback(true);
    });
  }

  login = () => {
    this.auth0.authorize();
  }

  loggedIn = (cookie) => {
    // Check whether the current time is past the Access Token's expiry time
    let expiresAt = null;
    if (cookie) {
      expiresAt = this.parseCookie(cookie, 'expires_at');
    } else {
      expiresAt = Cookie.get('expires_at');
    }
    return expiresAt ? (new Date().getTime() < JSON.parse(expiresAt)) : false;
  }

  setToken(authResult) {
    // Set the time that the Access Token will expire at
    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    Cookie.set('access_token', authResult.accessToken, { domain: `.${UI_HOSTNAME}` });
    Cookie.set('id_token', authResult.idToken, { domain: `.${UI_HOSTNAME}` });
    Cookie.set('expires_at', expiresAt, { domain: `.${UI_HOSTNAME}` });
  }

  getToken = (cookie) => {
    if (cookie && this.loggedIn(cookie)) {
      return {
        access_token: this.parseCookie(cookie, 'access_token'),
        id_token: this.parseCookie(cookie, 'id_token'),
      };
    }
    if (this.loggedIn()) {
      return {
        access_token: Cookie.get('access_token'),
        id_token: Cookie.get('id_token'),
      };
    }
    return null;
  }

  setTeamURL(teamURL) {
    Cookie.set('team_url', `${teamURL}.${UI_HOSTNAME}`, { domain: `.${UI_HOSTNAME}` });
  }

  getTeamURL() {
    return Cookie.get('team_url');
  }

  logout(redirect) {
    // Clear teamURL, Access Token and ID Token from cookies
    Cookie.remove('team_url', { domain: `.${UI_HOSTNAME}` });
    Cookie.remove('access_token', { domain: `.${UI_HOSTNAME}` });
    Cookie.remove('id_token', { domain: `.${UI_HOSTNAME}` });
    Cookie.remove('expires_at', { domain: `.${UI_HOSTNAME}` });
    if (redirect) {
      window.location = `//www.${UI_HOSTNAME}`;
    }
  }
}
