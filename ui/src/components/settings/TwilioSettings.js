/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  InputAdornment,
  Typography,
  TextField,
  withStyles,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Check from '@material-ui/icons/Check';
import AddCircle from '@material-ui/icons/AddCircle';
import { post, get, withAuth } from '../../util';


const fieldID = 'twilioSettings';

const styles = theme => ({
  root: {
    width: '94%',
    maxWidth: 1000,
  },
  heading: {
    paddingLeft: 16,
    fontSize: theme.typography.pxToRem(15),
    flexBasis: '33.33%',
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  savedMessage: {
    paddingLeft: 16,
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.success.light,
    '& [class^="MuiSvgIcon"]': {
      marginBottom: -6,
    },
  },
  detailsContainer: {
    display: 'flex',
    flexFlow: 'row wrap',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: '40%',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
  phoneNumbers: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  phoneNumberRow: {
    display: 'flex',
    flexDirection: 'row',
  },
  phoneNumberField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: '100%',
    maxWidth: 300,
  },
  addPhone: {
    width: '100%',
    maxWidth: 300,
  },
  leftIcon: {
    marginRight: theme.spacing.unit,
  },
});

class TwilioSettings extends React.Component {
  state = {
    savedaccountSID: '',
    savedauthToken: '',
    accountSID: '',
    authToken: '',
    phoneNumbers: [''],
    loaded: false,
    expanded: null,
    error: null,
    saved: false,
  };

  componentDidMount = async () => {
    const { submitHandler, user } = this.props;
    submitHandler(fieldID, this.submit.bind(this));

    // get twilio integration details from API
    // todo get phone numbers in same query
    const integrationData = await get('/integration?twilio', user.id_token);
    if (integrationData) {
      this.setState({
        loaded: true,
        savedaccountSID: integrationData.authentication.accountSID,
        savedauthToken: integrationData.authentication.authToken,
        phoneNumbers: integrationData.providers,
      });
    }
    this.setState({ loaded: true });
  }

  submit = () => {
    const { user, handleUnchanged } = this.props;
    const {
      accountSID, authToken, savedaccountSID, savedauthToken, phoneNumbers,
    } = this.state;
    post('/integration/save', user.id_token, {
      authentication: {
        accountSID: accountSID || savedaccountSID,
        authToken: authToken || savedauthToken,
      },
      name: 'twilio',
      providers: phoneNumbers,
    }).then(() => {
      this.setState({
        savedaccountSID: accountSID,
        savedauthToken: authToken,
        saved: true,
        expanded: false,
      });

      handleUnchanged(fieldID);

      setTimeout(() => this.setState({ saved: false }), 2000);
    }).catch((e) => {
      // show "error" message
      console.error(e);
    });
  }

  handleOpen = panel => (event, expanded) => {
    this.setState({
      expanded: expanded ? panel : false,
    });
  };

  handleChange = name => (event) => {
    const { handleChanged, handleUnchanged } = this.props;
    this.setState({
      [name]: event.target.value,
    });
    // check that team URL is different
    // eslint-disable-next-line react/destructuring-assignment
    if (event.target.value !== this.state[`saved${name}`]) {
      handleChanged(fieldID);
    } else {
      handleUnchanged(fieldID);
    }
  }

  handlePhoneNumberChange = index => (event) => {
    const { phoneNumbers } = this.state;
    const { handleChanged } = this.props;
    const newNumbers = phoneNumbers;
    newNumbers[index] = parseInt(event.target.value, 10)
      ? parseInt(event.target.value, 10)
      : '';

    this.setState({
      phoneNumbers: newNumbers,
    });

    // any phone number modification counts as a change
    handleChanged(fieldID);
  }

  handleAddPhone = () => {
    this.setState(prevState => ({
      phoneNumbers: [...prevState.phoneNumbers, ''],
    }));
  }

  handleRemovePhone = (index) => {
    const { phoneNumbers } = this.state;
    this.setState({
      phoneNumbers: phoneNumbers.filter((_, i) => i !== index),
    });
  }

  render() {
    const { classes } = this.props;
    const {
      expanded, loaded, accountSID, authToken, savedaccountSID, savedauthToken, phoneNumbers, saved,
    } = this.state;

    let summary = 'Not set up';

    if (savedaccountSID || savedauthToken) {
      summary = 'Configured';
    }

    if (phoneNumbers[phoneNumbers.length - 1] !== '') {
      summary += ` | ${phoneNumbers.length} phone number`;
      if (phoneNumbers.length > 1) {
        summary += 's';
      }
    }

    if ((accountSID && accountSID !== savedaccountSID) || (authToken && authToken !== savedauthToken)) {
      summary = 'You have not saved these changes';
    }

    return (
      <div className={classes.root}>
        <ExpansionPanel expanded={expanded === 'panel1'} onChange={this.handleOpen('panel1')}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <img height={24} width={24} src="/static/providers/twilio-logo.png" alt="twilio logo" />
            <Typography className={classes.heading}>
              Twilio
              <span style={{ visibility: (saved) ? 'visible' : 'hidden' }} className={classes.savedMessage}>
                <Check />
                {' '}
                Saved!
              </span>
            </Typography>
            <Typography className={classes.secondaryHeading}>{(loaded) ? summary : ''}</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className={classes.detailsContainer}>
            <TextField
              id="twilio-account-sid"
              key={loaded ? 'twilio-account-sid' : 'twilio-account-sid-loading'}
              onChange={this.handleChange('accountSID')}
              label="Account SID"
              placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className={classes.textField}
              defaultValue={savedaccountSID}
              margin="normal"
              variant="outlined"
              disabled={!loaded}
            />
            <TextField
              id="twilio-auth-token"
              key={loaded ? 'twilio-auth-token' : 'twilio-auth-token-loading'}
              onChange={this.handleChange('authToken')}
              label="Auth Token"
              placeholder="yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy"
              className={classes.textField}
              defaultValue={savedauthToken}
              margin="normal"
              variant="outlined"
              disabled={!loaded}
            />
            <div className={classes.phoneNumbers}>
              {phoneNumbers.map((number, index) => {
                const key = `PhoneNumber${index}`;
                return (
                  <div key={key} className={classes.phoneNumberRow}>
                    <TextField
                      id="outlined-number"
                      label="Phone Number"
                      className={classes.phoneNumberField}
                      value={number}
                      onChange={this.handlePhoneNumberChange(index)}
                      margin="normal"
                      // error={submitted && phoneNumber === ''}
                      variant="outlined"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">+</InputAdornment>,
                      }}
                    />
                    {(phoneNumbers.length > 1)
                      ? <Button onClick={() => { this.handleRemovePhone(index); }}>Remove</Button>
                      : ''}
                  </div>
                );
              })}
              <Button onClick={this.handleAddPhone} className={classes.addPhone}>
                <AddCircle className={classes.leftIcon} />
                Add Phone Number
              </Button>
            </div>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </div>
    );
  }
}

TwilioSettings.defaultProps = {};
TwilioSettings.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withAuth(withStyles(styles)(TwilioSettings));
