/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import React from 'react';
import App, { Container } from 'next/app';
import { MuiThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import JssProvider from 'react-jss/lib/JssProvider';
import getPageContext from '../src/getPageContext';
import { Auth } from '../src/util/authContext';
import AuthService from '../src/util/AuthService';

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
  }

    pageContext = null;

    componentDidMount() {
      // Remove the server-side injected CSS.
      const jssStyles = document.querySelector('#jss-server-side');
      if (jssStyles && jssStyles.parentNode) {
        jssStyles.parentNode.removeChild(jssStyles);
      }
    }

    render() {
      const { Component, pageProps } = this.props;
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
              {/* Pass pageContext to the _document though the renderPage enhancer
                            to render collected styles on server side. */}
              <Auth.Provider value={{
                user: pageProps.user,
              }}
              >
                <Component pageContext={this.pageContext} {...pageProps} />
              </Auth.Provider>
            </MuiThemeProvider>
          </JssProvider>
        </Container>
      );
    }
}

export default MyApp;
