/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 *
 * This file extends from the example at https://gist.github.com/lfalke/1c5e7168424c8b2a65dcfba425fcc310
 * @file A Wrapper for the <FormControl>, <InputLabel>, <Error> and the Stripe <*Element>.
 * Similar to Material UI's <TextField>. Handles focused, empty and error state
 * to correctly show the floating label and error messages etc.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { FormControl, OutlinedInput, InputLabel } from '@material-ui/core';

import StripeInput from './StripeInput';
// import Errors from './Errors';

export default class extends PureComponent {
  static displayName = 'StripeElementWrapper'

  static propTypes = {
    component: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
  }

  state = {
    focused: false,
    empty: true,
    error: false,
  }

  handleBlur = () => {
    this.setState({ focused: false });
  }

  handleFocus = () => {
    this.setState({ focused: true });
  }

  handleChange = (changeObj) => {
    const {
      handleError, handleUnchanged, handleChanged, label,
    } = this.props;
    if (changeObj.error) {
      handleError(label, true);
    } else {
      handleError(label, false);
    }
    if (changeObj.empty) {
      handleUnchanged(label);
    } else {
      handleChanged(label);
    }
    this.setState({
      error: changeObj.error,
      empty: changeObj.empty,
    });
  }

  render() {
    const { component, label } = this.props;
    const { focused, empty, error } = this.state;

    return (
      <div>
        <FormControl fullWidth margin="normal" variant="outlined">
          <InputLabel
            focused={focused}
            shrink={focused || !empty}
            error={!!error}
          >
            {label}
          </InputLabel>
          <OutlinedInput
            fullWidth
            labelWidth={label.length * 9} // need a more consistent width
            inputComponent={StripeInput}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            onChange={this.handleChange}
            inputProps={{ component }}
            style={{ paddingLeft: 16 }}
          />
        </FormControl>
        {/* {error && <Errors>{error.message}</Errors>} */}
      </div>
    );
  }
}
