/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import React from 'react';
import App, { Container } from 'next/app';
import EventSource from 'eventsource';
import { CssBaseline, MuiThemeProvider } from '@material-ui/core';
import JssProvider from 'react-jss/lib/JssProvider';
import getPageContext from '../src/getPageContext';
import { Auth, AuthService, Conversations, get } from '../src/util';

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};
    const { req } = ctx;

    const isServer = typeof window === 'undefined';
    this.user = null;
    this.auth = await new AuthService();

    if (isServer && req.headers) {
      const { cookie } = req.headers;

      if (cookie) {
        pageProps.user = await this.auth.getUser(cookie);
      }
    } else {
      pageProps.user = await this.auth.getUser();
    }

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps };
  }

  constructor(props) {
    super(props);
    this.pageContext = getPageContext();
    this.state = {
      conversationList: [],
      loaded: false,
    }
  }

  pageContext = null;

  componentDidMount() {
    const { pageProps } = this.props;
    const { user } = pageProps;

    if (user) {
      // fetch initial conversations for user
      get('/conversation/list', user.id_token).then((data) => {
        this.setState({
          loaded: true,
          conversationList: data, // update conversation list
          // todo go directly to conversation based on hash/route
        });
      }).catch((error) => {
        console.error(error); // todo pretty error message
      });

      // update conversation list on EventSource update
      this.sse = new EventSource("https://api.anymessage.io/conversation/subscribe", { withCredentials: true });
      this.sse.onmessage = (e) => {
        if (e.data) {
          this.updateConversationList(JSON.parse(e.data));
        }
      }
      this.sse.onerror = (e) => {
        console.error(e); // todo pretty error message
      };

      return true;
    }

    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles && jssStyles.parentNode) {
      jssStyles.parentNode.removeChild(jssStyles);
    }
  }

  componentWillUnmount() {
    this.sse.close();
  }

  updateConversationList = (newConversation) => {
    let found = false;
    this.setState(state => {
      let conversationList = state.conversationList.map((item) => {
        if (item.id === newConversation.id) {
          found = true;
          return newConversation;
        } else {
          return item;
        }
      });

      if (!found) {
        conversationList.unshift(newConversation);
      }

      return {
        conversationList
      }
    })
  }

  render() {
    const { Component, pageProps } = this.props;
    const { conversationList, loaded } = this.state;
    return (
      <Container>
        {/* Wrap every page in Jss and Theme providers */}
        <JssProvider
          registry={this.pageContext.sheetsRegistry}
          generateClassName={this.pageContext.generateClassName}
        >
          {/* MuiThemeProvider makes the theme available down the React
                        tree thanks to React context. */}
          <MuiThemeProvider
            theme={this.pageContext.theme}
            sheetsManager={this.pageContext.sheetsManager}
          >
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            <Auth.Provider value={{
              user: pageProps.user,
            }}
            >
              <Conversations.Provider value={{
                conversationList,
                conversationsLoaded: loaded
              }}>
                {/* Pass pageContext to the _document though the renderPage enhancer
                        to render collected styles on server side. */}
                <Component pageContext={this.pageContext} {...pageProps} />
              </Conversations.Provider>
            </Auth.Provider>
          </MuiThemeProvider>
        </JssProvider>
      </Container>
    );
  }
}

export default MyApp;
