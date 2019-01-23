/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Typography, TextField, withStyles } from '@material-ui/core';
import Check from '@material-ui/icons/Check';

import { post, get, AuthService, withAuth } from '../../util';

const fieldID = 'teamURL';

const styles = theme => ({
  urlInput: {
    margin: 0,
    width: 160,
    '& input': {
      textAlign: 'right',
    },
  },
  domain: {
    ...theme.typography.body1,
    paddingLeft: 8,
  },
  available: {
    fontSize: 16,
  },
  label: {
    backgroundColor: '#fafafa',
  },
});

class TeamURL extends React.Component {
  state = {
    teamURL: '',
    newURL: '',
    loaded: false,
    available: null,
    error: null,
  }

  componentDidMount = async () => {
    const { submitHandler, user } = this.props;
    submitHandler(fieldID, this.submit.bind(this));

    // get team URL from API
    const teamData = await get('/team/url', user.id_token);
    this.setState({ teamURL: teamData.teamURL, loaded: true });
  }

  submit = async () => {
    const { user } = this.props;
    const { newURL } = this.state;
    try {
      const res = await post('/team/url/set', user.id_token, { newURL });
      if (res.redirectHost) {
        const auth = new AuthService();
        auth.setTeamURL(newURL);
        window.location = res.redirectHost + window.location.pathname;
      }
    } catch (e) {
      console.error(e);
    }
  }

  handleChange = name => (event) => {
    const { handleChanged, handleUnchanged } = this.props;
    const { teamURL, error } = this.state;
    if (event.target.value && error === 'Cannot be empty') {
      this.setState({ error: null });
    }
    this.setState({
      newURL: event.target.value,
    }, this.checkAvailable);
    // check that team URL is different
    if (event.target.value !== teamURL) {
      handleChanged(name);
    } else {
      handleUnchanged(name);
    }
    // if it is, mark as changed
    // if it's not, mark as unchanged
  }

  checkAvailable = async () => {
    const { user } = this.props;
    const { teamURL, newURL } = this.state;

    if (newURL !== teamURL) {
      if (newURL.length > 0) {
        const res = await post('/team/url/available', user.id_token, { newURL });
        if (res.available) {
          this.setState({ available: res.available, error: null });
        } else {
          this.setState({ available: res.available, error: 'Not Available' });
        }
      } else {
        this.setState({ available: null, error: 'Cannot be empty' });
      }
    } else {
      this.setState({ available: null, error: null });
    }
  }

  render() {
    const { classes } = this.props;
    const {
      teamURL, loaded, error, available,
    } = this.state;

    let label = '';
    if (error) {
      label = error;
    }

    if (available) {
      label = (
        <React.Fragment>
          <Check className={classes.available} />
          {' '}
          Available
          </React.Fragment>
      );
    }

    if (available !== null && available === false) {
      label = 'Not Available';
    }

    return (
      <React.Fragment>
        <Typography variant="overline">
          Team URL:
          </Typography>
        <Grid
          container
          direction="row"
          justify="flex-start"
          alignItems="center"
        >
          <TextField
            id="teamURL"
            key={loaded ? 'teamURL' : 'teamURL-loading'}
            onChange={this.handleChange(fieldID)}
            error={error !== null}
            label={label}
            InputLabelProps={{ focused: true, classes: { root: classes.label }, shrink: true }}
            className={classes.urlInput}
            defaultValue={teamURL}
            margin="normal"
            variant="outlined"
            disabled={!loaded} // todo only admins should be able to do this
          />
          <span className={classes.domain}>
            .anymessage.io
            </span>
        </Grid>
      </React.Fragment>
    );
  }
}

TeamURL.defaultProps = {
  user: null,
};
TeamURL.propTypes = {
  submitHandler: PropTypes.func.isRequired,
  handleChanged: PropTypes.func.isRequired,
  handleUnchanged: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  user: PropTypes.object,
};

export default withAuth(withStyles(styles)(TeamURL));
