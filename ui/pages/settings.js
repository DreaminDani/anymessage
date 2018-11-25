/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import React from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Head from 'next/head';
import Button from '@material-ui/core/Button';
import SaveIcon from '@material-ui/icons/Save';
import Divider from '@material-ui/core/Divider';

import Header from '../src/components/Header';

import TeamURL from '../src/components/settings/TeamURL';
import TwilioSettings from '../src/components/settings/TwilioSettings';

const styles = theme => ({
  container: {
    marginTop: 40,
    marginLeft: 80,
  },
  save: {
    position: 'absolute',
    top: 40,
    left: 8,
  },
  divider: {
    marginBottom: 16,
  },
  nextHeading: {
    marginTop: 32,
  },
});

class Settings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      changedSettings: new Set(),
    };

    this.save = [];
  }

  componentDidMount = () => {
    const { user } = this.props;

    if (!user) {
      Router.push('/');
    }
  }

  registerSubmitHandler = (fieldID, submitHandler) => {
    this.save[fieldID] = submitHandler;
  }

  handleSaveClick = () => {
    const { changedSettings } = this.state;
    if (changedSettings.size > 0) {
      const changedFields = Array.from(changedSettings);
      for (let i = 0; i < changedFields.length; i += 1) {
        this.save[changedFields[i]]();
      }
    }
  }

  handleChanged = (fieldID) => {
    this.setState(({ changedSettings }) => ({
      changedSettings: new Set(changedSettings.add(fieldID)),
    }));
  }

  handleUnchanged = (fieldID) => {
    this.setState(({ changedSettings }) => {
      const newChanged = new Set(changedSettings);
      newChanged.delete(fieldID);

      return {
        changedSettings: newChanged,
      };
    });
  }


  render() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <Head>
          <title>Settings</title>
        </Head>
        <Header currentPage="settings" />
        <Button onClick={this.handleSaveClick} variant="fab" color="secondary" aria-label="Save" className={classes.save}>
          <SaveIcon />
        </Button>
        <div className={classes.container}>
          <Typography variant="h3" gutterBottom>
            Team Settings
          </Typography>
          <Divider className={classes.divider} />
          <TeamURL
            submitHandler={this.registerSubmitHandler}
            handleChanged={this.handleChanged}
            handleUnchanged={this.handleUnchanged}
          />
          <Typography variant="h3" className={classes.nextHeading} gutterBottom>
            Integrations
          </Typography>
          <Divider className={classes.divider} />
          <TwilioSettings
            submitHandler={this.registerSubmitHandler}
            handleChanged={this.handleChanged}
            handleUnchanged={this.handleUnchanged}
          />
        </div>
      </React.Fragment>
    );
  }
}

Settings.defaultProps = {};

Settings.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Settings);
