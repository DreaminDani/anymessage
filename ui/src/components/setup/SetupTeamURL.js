/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Divider, Typography, withStyles } from '@material-ui/core';
import { withAuth } from '../../util';
import TeamURL from '../settings/TeamSettings/TeamURL';

const styles = {
  helperText: {
    marginTop: 8,
    opacity: 0.54,
  },
};

class SetupTeamURL extends React.Component {
  componentDidMount = () => {
    const { user, setValid } = this.props;
    if (user && user.teamURL) {
      setValid(true);
    }
  }

  handleChanged = (fieldID) => {
    const { setValid } = this.props;
    setValid(true);
  }

  handleUnchanged = (fieldID) => {
    const { setValid } = this.props;
    setValid(true);
  }

  handleError = (fieldID) => {
    const { setValid } = this.props;
    setValid(false);
  }

  render() {
    const { classes, registerSubmitHandler, user } = this.props;

    let notSet = true;
    if (user && user.teamURL) {
      notSet = false;
    }

    return (
      <React.Fragment>
        {notSet && (
          <Typography variant="subtitle1">
            It looks like you're not yet associated with an existing team. To create one, enter a URL below'
          </Typography>
        )}
        <TeamURL
          fieldID={0}
          submitHandler={registerSubmitHandler}
          setup
          handleChanged={this.handleChanged}
          handleUnchanged={this.handleUnchanged}
          handleError={this.handleError}
        />
        <Typography variant="body2" className={classes.helperText}>
          You can change this at any time in your Team's Settings
        </Typography>
      </React.Fragment>
    );
  }
}

SetupTeamURL.defaultProps = {
  user: null,
  setValid: (boolean) => { },
};

SetupTeamURL.propTypes = {
  classes: PropTypes.object.isRequired,
  registerSubmitHandler: PropTypes.func.isRequired,
  user: PropTypes.object,
  setValid: PropTypes.func,
};

export default withAuth(withStyles(styles)(SetupTeamURL));
