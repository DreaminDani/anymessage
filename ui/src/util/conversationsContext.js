/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import React from 'react';

export const Conversations = React.createContext({
  conversationList: [],
  // updateConversationList: () => { },
  conversationsLoaded: false,
});

// This function takes a component...
export function withConversations(Component) {
  // ...and returns another component...
  return function ConversationsComponent(props) {
    // ... and renders the wrapped component with the context theme!
    // Notice that we pass through any additional props as well
    return (
      <Conversations.Consumer>
        {({ conversationList, conversationsLoaded }) => (
          <Component
            {...props}
            conversationList={conversationList}
            conversationsLoaded={conversationsLoaded}
          />
        )}
      </Conversations.Consumer>
    );
  };
}
