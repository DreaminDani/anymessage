/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import getConfig from 'next/config';
import fetch from 'isomorphic-unfetch';

const { publicRuntimeConfig } = getConfig();
const { API_ENDPOINT, UI_HOSTNAME } = publicRuntimeConfig;

// shim for server side fetch
const api = (process.browser) ? API_ENDPOINT : 'http://api:1337';

function FetchErrorException(status, message) {
  this.status = status;
  this.message = message;
  this.toString = () => `${this.status}: ${this.message}`;
}

export function post(url = '', token, data = {}) {
  // Default options are marked with *
  const options = {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, cors, *same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    // credentials: "same-origin", // include, same-origin, *omit
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer', // no-referrer, *client
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  };

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  return fetch(api + url, options).then(response => response.json().then((json) => {
    if (response.ok) {
      return json;
    }
    throw new FetchErrorException(response.status, json.error || response.statusText);
  }).catch((err) => {
    if (response.ok) {
      return '';
    }

    if (response.status === 403) {
      window.location = `//www.${UI_HOSTNAME}?unauthorized`;
    }
    throw new FetchErrorException(response.status, err.message || response.statusText);
  }));
}

export function get(url = '', token) {
  const options = {
    method: 'GET', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, cors, *same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    // credentials: "same-origin", // include, same-origin, *omit
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer', // no-referrer, *client
  };

  if (token) {
    if (!options.headers) {
      options.headers = {};
    }
    options.headers.Authorization = `Bearer ${token}`;
  }
  return fetch(api + url, options).then(response => response.json().then((json) => {
    if (response.ok) {
      return json;
    }
    throw new FetchErrorException(response.status, json.error || response.statusText);
  }).catch((err) => {
    if (response.ok) {
      return '';
    }

    if (response.status === 403) {
      window.location = `//www.${UI_HOSTNAME}?unauthorized`;
    }

    throw new FetchErrorException(response.status, err.message || response.statusText);
  }));
}

export default { post, get };
