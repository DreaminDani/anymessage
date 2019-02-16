/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import React from 'react';

export const Auth = React.createContext({
  auth: null,
  logout: () => { },
  login: () => { },
});

// This function takes a component...
export function withAuth(Component) {
  // ...and returns another component...
  return function AuthComponent(props) {
    return (
      <Auth.Consumer>
        {({ user }) => (
          <Component
            {...props}
            user={user}
          />
        )}
      </Auth.Consumer>
    );
  };
}
