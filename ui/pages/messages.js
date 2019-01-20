/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
/* eslint-disable jsx-a11y/anchor-is-valid */

import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Router from 'next/router';
import Head from 'next/head';

import { withAuth } from '../src/util/authContext';
import { withConversations } from '../src/util/conversationsContext';

import Header from '../src/components/Header';
import ConversationList from '../src/components/messages/ConversationList';
import Conversation from '../src/components/messages/Conversation';
import ConversationView from '../src/components/messages/ConversationView';
import { getHashAsObject } from '../src/util';

const styles = theme => ({
  root: {},
  create: {
    position: 'absolute',
    top: 40,
    right: 32,
  },
  conversation: {
    paddingRight: 24,
  },
});

class Messages extends React.Component {
  state = {
    newConversation: false,
    currentConversation: null,
    mobileOpen: false,
  }

  // get conversations or redirect unauthed user to "/"
  componentDidMount = () => {
    const { user } = this.props;

    if (user) {
      // make sure user has a team url
      if (!user.teamURL) {
        window.location = `${window.location.protocol}//${user.teamURL}/settings`; // todo, navigate user to setup instead
      }

      // make sure user is accessing messages from their team url
      if (window.location.hostname !== user.teamURL) {
        window.location = `${window.location.protocol}//${user.teamURL}/messages`;
      }

      return true;
    }

    Router.push('/');
    return false;
  }

  componentDidUpdate = () => {
    const { conversationsLoaded } = this.props;
    const { currentConversation } = this.state;
    // check if message id in URL, if so, attempt to show message
    if (window.location.hash && conversationsLoaded) {
      const hashObject = getHashAsObject(window.location.hash);
      const hashedId = parseInt(hashObject.id);
      if (hashedId > -1 && hashedId !== currentConversation) {
        this.setState({
          currentConversation: hashedId,
        })
      }
    }
  }

  setConversation = async (conversationID) => {
    this.setState({
      newConversation: false,
      currentConversation: conversationID,
    });
  }

  findConversationByID = (id) => {
    const { conversationList } = this.props;
    for (let i = 0; i < conversationList.length; i += 1) {
      if (conversationList[i].id && conversationList[i].id === id) {
        return conversationList[i];
      }
    }
    return null;
  }

  newConversationClick = () => {
    const { newConversation } = this.state;
    if (newConversation) {
      this.setState({
        newConversation: false,
        currentConversation: null,
      });
    } else {
      this.setState({
        newConversation: true,
        currentConversation: null,
      });
    }
  };

  onMenuClick = () => {
    this.setState(state => ({ mobileOpen: !state.mobileOpen }));
  }

  render() {
    const { classes, conversationList, conversationsLoaded } = this.props;
    const {
      newConversation, currentConversation, mobileOpen,
    } = this.state;

    let messagesTitle = 'Messages';
    if (currentConversation) {
      messagesTitle = `Messages: ${this.findConversationByID(currentConversation).to}`;
    }
    if (newConversation) {
      messagesTitle = 'Messages: New';
    }

    return (
      <div className={classes.root}>
        <Head>
          <title>{messagesTitle}</title>
        </Head>
        <Header currentPage="messages" title={messagesTitle} onMenuClick={this.onMenuClick} />
        <Grid
          container
          direction="row"
          justify="flex-start"
          alignItems="flex-start"
        >
          <Grid item xs={3}>
            <ConversationList
              newConversation={newConversation}
              newConversationClick={this.newConversationClick}
              selectedConvo={currentConversation}
              setConversation={this.setConversation}
              conversationList={conversationList}
              mobileOpen={mobileOpen}
              handleDrawerToggle={this.onMenuClick}
              loaded={conversationsLoaded}
            />
          </Grid>
          <Grid item xs={12} md={9} className={classes.conversation}>
            {currentConversation
              ? (
                <ConversationView
                  conversation={this.findConversationByID(currentConversation)}
                  setConversation={this.setConversation}
                />
              )
              : (
                <Conversation
                  newConversation={newConversation}
                  setConversation={this.setConversation}
                />
              )
            }
          </Grid>
        </Grid>
      </div>
    );
  }
}

Messages.defaultProps = {
  user: null,
};

Messages.propTypes = {
  classes: PropTypes.object.isRequired,
  user: PropTypes.object,
};

export default withConversations(withAuth(withStyles(styles)(Messages)));
