/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
/* eslint-disable no-underscore-dangle */

import { SheetsRegistry } from 'jss';
import { createMuiTheme, createGenerateClassName } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';
import amber from '@material-ui/core/colors/amber';
import green from '@material-ui/core/colors/green';

// A theme with custom primary and secondary color.
// https://material.io/tools/color/#!/?view.left=0&view.right=0&primary.color=1976D2&secondary.color=FFC400
// See: https://github.com/mui-org/material-ui/blob/d5d11914959c34ab70a6871aa9c634438560fd4f/packages/material-ui/src/styles/createPalette.d.ts
const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#63a4ff',
      main: blue[700],
      dark: '#004ba0',
    },
    secondary: {
      light: '#fff64f',
      main: amber.A400,
      dark: '#c79400',
    },
    success: green.A400,
  },
  header: {
    height: 64,
  },
  typography: {
    useNextVariants: true,
  },
});

function createPageContext() {
  return {
    theme,
    // This is needed in order to deduplicate the injection of CSS in the page.
    sheetsManager: new Map(),
    // This is needed in order to inject the critical CSS.
    sheetsRegistry: new SheetsRegistry(),
    // The standard class name generator.
    generateClassName: createGenerateClassName(),
  };
}

export default function getPageContext() {
  // Make sure to create a new context for every server-side request so that data
  // isn't shared between connections (which would be bad).
  if (!process.browser) {
    return createPageContext();
  }

  // Reuse context on the client-side.
  if (!global.__INIT_MATERIAL_UI__) {
    global.__INIT_MATERIAL_UI__ = createPageContext();
  }

  return global.__INIT_MATERIAL_UI__;
}
