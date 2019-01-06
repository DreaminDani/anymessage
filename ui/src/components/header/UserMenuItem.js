/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import React from 'react';
import PropTypes from 'prop-types';

const styles = theme => ({});

class UserMenuItem extends React.Component {
  render() {
    const { classes } = this.props;
    return <div>Test</div>;
  }
}

UserMenuItem.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(UserMenuItem);
