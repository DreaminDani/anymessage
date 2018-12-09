/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import Send from '@material-ui/icons/Send';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import { withAuth } from '../../util/authContext';
import { post } from '../../util/api';
import Message from './Message';

const INIT_MESSAGE_HEIGHT = 64;
const LINE_HEIGHT = 19;

const styles = theme => ({
  root: {
    width: '100%',
    height: `calc(100vh - ${theme.header.height * 2}px)`,
    borderRadius: theme.shape.borderRadius,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.23)',
    margin: 16,
  },
  textField: {
    width: '100%',
    marginBottom: 0,
    marginTop: 8,
  },
  historyWrap: {
    width: '100%',
    overflowY: 'scroll',
  },
});

class ConversationView extends React.Component {
    state = {
      message: '',
      messageHeight: INIT_MESSAGE_HEIGHT + LINE_HEIGHT,
    };

    componentDidMount() {
      // scroll to the bottom of conversation (doesn't always work)
      this.scrollConvo = document.getElementById('scrollConvo');
      this.scrollConvo.scrollTop = this.scrollConvo.scrollHeight;

      // add CMD enter event listener
      document.getElementById('message').addEventListener('keydown', (e) => {
        if (e.keyCode === 13 && e.metaKey) {
          this.sendMessage();
        }
      });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
      // scroll down to the bottom if new message was added.
      if (snapshot !== null) {
        this.scrollConvo.scrollTop = this.scrollConvo.scrollHeight;
      }
    }

    getSnapshotBeforeUpdate(prevProps, prevState) {
      // check if new message added to history
      const { conversation } = this.props;
      if (prevProps.conversation.history.length < conversation.history.length) {
        return true;
      }
      return null;
    }

    handleChange = name => (event) => {
      const { messageHeight } = this.state;
      let change = 0;

      // change height based on message height
      if (!event.target.value) {
        change = (INIT_MESSAGE_HEIGHT + LINE_HEIGHT) - messageHeight;
      } else if (event.target.value.slice(-1) === '\n') {
        change += LINE_HEIGHT;
      } else {
        change += event.target.clientHeight - (messageHeight - INIT_MESSAGE_HEIGHT);
      }

      // keep user at the bottom if they haven't scrolled up
      if (change !== 0 && (this.scrollConvo.scrollHeight - this.scrollConvo.clientHeight) <= this.scrollConvo.scrollTop + LINE_HEIGHT) {
        this.scrollConvo.scrollTop = this.scrollConvo.scrollHeight;
      }

      this.setState({
        [name]: event.target.value,
        messageHeight: messageHeight + change,
      });
    };

    sendMessage = () => {
      const { message } = this.state;
      const {
        user, conversation,
      } = this.props;
      if (conversation.to && message) {
        // send message
        post('/conversation/add',
          user.id_token, {
            phoneNumber: conversation.to,
            message,
            provider: conversation.from,
          }).then((data) => {
          this.setState({ message: '', messageHeight: INIT_MESSAGE_HEIGHT + LINE_HEIGHT });
        }).catch(error => console.error(error)); // TODO show error using Snackbar
      }
    }

    render() {
      const { classes, conversation } = this.props;
      const { message, messageHeight } = this.state;
      return (
        <Grid
          className={classes.root}
          container
          direction="row"
          justify="flex-start"
          alignItems="flex-end"
        >
          <div id="scrollConvo" className={classes.historyWrap} style={{ height: `calc(100% - ${messageHeight}px)` }}>
            {conversation.history.map(event => <Message message={event} key={event.timestamp} />)}
          </div>

          <TextField
            id="message"
            label="New message"
            placeholder="Press CMD/CTRL enter to send"
            multiline
            onChange={this.handleChange('message')}
            className={classes.textField}
            margin="normal"
            variant="outlined"
            value={message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Send message"
                    onClick={this.sendMessage}
                  >
                    {(message.length > 0) ? <Send /> : ''}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      );
    }
}

ConversationView.defaultProps = {
  user: null,
};

ConversationView.propTypes = {
  classes: PropTypes.object.isRequired,
  user: PropTypes.object,
  conversation: PropTypes.object.isRequired,
};

export default withAuth(withStyles(styles)(ConversationView));
