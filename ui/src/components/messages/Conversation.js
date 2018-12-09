/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

import { withAuth } from '../../util/authContext';
import { get, post } from '../../util/api';
import WaitingConversation from '../illustrations/waiting-conversation';

const styles = theme => ({
  root: {
    width: '100%',
    [theme.breakpoints.down('md')]: {
      paddingLeft: 108,
    },
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 40,
    },
  },
  placeholder: {
    textAlign: 'center',
    paddingTop: 56,
  },
  waitingConversation: {
    height: '60vh',
    [theme.breakpoints.down('sm')]: {
      height: '80vh',
    },
    [theme.breakpoints.down('xs')]: {
      height: '40vh',
    },
  },
  create: {
    paddingTop: 24,
    margin: '0 24px',
  },
  message: {
    width: '100%',
  },
  phoneNumber: {
    marginRight: 16,
  },
  providerField: {
    width: '50%',
    [theme.breakpoints.down('xs')]: {
      width: '100%',
    },
  },
  createButton: {
    marginTop: 24,
    float: 'right',
  },
});

class Conversation extends React.Component {
    state = {
      phoneNumber: '',
      message: '',
      loaded: false,
      submitted: false,
      providers: [],
      selectedProvider: '',
    };

    componentDidMount = () => {
      const { user } = this.props;
      get('/integration/providers', user.id_token).then((data) => {
        if (data) {
          this.setState({
            loaded: true,
            providers: data,
          });
        }
      }).catch(err => console.error(err));
    }

    handleChange = name => (event) => {
      if (name === 'phoneNumber') {
        this.setState({
          [name]: parseInt(event.target.value, 10)
            ? parseInt(event.target.value, 10)
            : '',
        });
      } else {
        this.setState({
          [name]: event.target.value,
        });
      }
    };

    createConversation = () => {
      const { phoneNumber, message, selectedProvider } = this.state;
      const { user, setConversation } = this.props;
      this.setState({ submitted: true });

      // TODO validate inputs (client side side)
      if (phoneNumber && message && selectedProvider) {
        // send message
        post('/conversation/add',
          user.id_token, {
            phoneNumber,
            provider: selectedProvider,
            message,
          }).then((data) => {
          setConversation(data[0].id); // update conversation
        }).catch(error => console.error(error)); // TODO show error using Snackbar
      }
    }

    render() {
      const { classes, newConversation } = this.props;
      const {
        submitted,
        phoneNumber,
        message,
        providers,
        selectedProvider,
        loaded,
      } = this.state;
      return (
        <div className={classes.root}>
          {newConversation ? (
            <div className={classes.create}>
              <Typography variant="h6">
                New conversation...
              </Typography>
              <TextField
                id="outlined-number"
                label="Recipient (Ph. #)"
                autoFocus
                className={classes.phoneNumber}
                value={phoneNumber}
                onChange={this.handleChange('phoneNumber')}
                margin="normal"
                error={submitted && phoneNumber === ''}
                variant="outlined"
                InputProps={{
                  startAdornment: <InputAdornment position="start">+</InputAdornment>,
                }}
                disabled={!loaded}
              />
              <TextField
                id="select-provider"
                select
                label="Select provider"
                className={classes.providerField}
                value={selectedProvider}
                onChange={this.handleChange('selectedProvider')}
                margin="normal"
                variant="outlined"
                disabled={!loaded}
              >
                {providers.map(provider => (
                  <MenuItem key={provider} value={provider}>
                    {provider}
                  </MenuItem>
                ))}
              </TextField>
              <br />
              <TextField
                id="outlined-message"
                label="Message"
                multiline
                rowsMax="4"
                value={message}
                error={submitted && message === ''}
                onChange={this.handleChange('message')}
                className={classes.message}
                variant="outlined"
                disabled={!loaded}
              />
              <Button
                variant="contained"
                color="primary"
                className={classes.createButton}
                onClick={this.createConversation}
                disabled={!loaded}
              >
                Create Conversation


              </Button>
            </div>
          ) : (
            <div className={classes.placeholder}>
              <Typography variant="h6" gutterBottom>
                Select a conversation or create a new one
              </Typography>
              <div className={classes.waitingConversation}>
                <WaitingConversation width="100%" height="100%" />
              </div>
            </div>
          )}
        </div>
      );
    }
}

Conversation.defaultProps = {
  newConversation: false,
  user: null,
};

Conversation.propTypes = {
  classes: PropTypes.object.isRequired,
  user: PropTypes.object,
  setConversation: PropTypes.func.isRequired,
  newConversation: PropTypes.bool,
};

export default withAuth(withStyles(styles)(Conversation));
