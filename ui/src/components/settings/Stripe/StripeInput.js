/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 *
 * This file extends from the example at https://gist.github.com/lfalke/1c5e7168424c8b2a65dcfba425fcc310
 * @file Wrapper around the actual Stripe <*Element>, so that it can be used as `inputComponent`
 * for Material UI's <Input>. Also adds some styling.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

const styles = () => ({
  root: {
    width: '100%',
    padding: '6px 0 7px',
    cursor: 'text',
  },
});

class StripeInput extends PureComponent {
  static displayName = 'StripeInput'

  static propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
    component: PropTypes.func.isRequired,
    onBlur: PropTypes.func,
    onFocus: PropTypes.func,
    onChange: PropTypes.func,
  }

  static defaultProps = {
    onFocus: () => { },
    onBlur: () => { },
    onChange: () => { },
  }

  render() {
    const {
      classes: c,
      theme,
      component: Component,
      onFocus,
      onBlur,
      onChange,
    } = this.props;

    return (
      <Component
        className={c.root}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={onChange}
        placeholder=""
        style={{
          base: {
            fontSize: `${theme.typography.fontSize}px`,
            fontFamily: theme.typography.fontFamily,
            color: '#000000de',
            lineHeight: '3.2em',
          },
        }}
      />
    );
  }
}

export default withStyles(styles, { withTheme: true })(StripeInput);
