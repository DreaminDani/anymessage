/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 *
 * @file Makes all utils available to import from the "./src/util" directory
 */

export * from './api';
export * from './authContext';
export { default as AuthService } from './AuthService';
export * from './conversationsContext';

export function getHashAsObject(windowHash) {
  const hash = windowHash.slice(1);
  const hashList = hash.split('&');
  const hashObject = {};
  let h;
  for (let i = 0; i < hashList.length; i++) {
    h = hashList[i].split('=');
    hashObject[h[0]] = h[1];
  }

  return hashObject;
}

export const urlSearchData = (searchString) => {
  if (!searchString) return false;

  return searchString
    .substring(1)
    .split('&')
    .reduce((result, next) => {
      const pair = next.split('=');
      result[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);

      return result;
    }, {});
};
