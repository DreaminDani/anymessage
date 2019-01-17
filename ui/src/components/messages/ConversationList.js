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
  withStyles, List, ListItem, ListItemText, Avatar, Drawer, Hidden, Typography, Button,
} from '@material-ui/core';
import { ImageIcon, WorkIcon, BeachAccessIcon } from '@material-ui/icons/Image';
import MailboxEmpty from '../illustrations/mailbox-empty';

const styles = theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  drawerPaper: {
    position: 'relative',
    maxWidth: 360,
    zIndex: theme.zIndex.drawer,
    [theme.breakpoints.up('md')]: {
      height: `calc(100vh - ${theme.header.height}px)`,
    },
  },
  emptyList: {
    paddingTop: 40,
    paddingLeft: 16,
    paddingRight: 16,
    opacity: 0.8,
    textAlign: 'center',
  },
  messagePreview: {
    maxHeight: 88,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  item: {
    cursor: 'pointer', // todo make this an actual button
  },
});

// @todo fix icon list so it's actually useful
function getIcon(type) {
  switch (type) {
    case 'sms':
      return <ImageIcon />;
    case 'whatsapp':
      return <WorkIcon />;
    case 'signal':
      return <BeachAccessIcon />;
    default:
      return <ImageIcon />;
  }
}

class ConversationList extends React.Component {
    handleClick = (conversationID) => {
      const { setConversation, handleDrawerToggle } = this.props;
      setConversation(conversationID);
      handleDrawerToggle();
    }

    render() {
      const {
        classes, theme, selectedConvo, conversationList, mobileOpen, handleDrawerToggle, newConversation, newConversationClick,
      } = this.props;

      let list = (
        <div className={classes.emptyList}>
          <Typography variant="subtitle2" gutterBottom>No conversations yet...</Typography>
          <MailboxEmpty width={200} height="100%" />
        </div>
      );
      if (conversationList && conversationList.length > 0) {
        list = (
          <List>
            {conversationList.map((conversation) => {
              if (conversation) {
                const lastMessage = (conversation) ? conversation.history[conversation.history.length - 1] : { type: '', message: '' };
                return (
                  <ListItem className={classes.item} selected={conversation.id === selectedConvo} key={conversation.id} onClick={() => this.handleClick(conversation.id)}>
                    <Avatar>
                      {() => getIcon(lastMessage.type)}
                    </Avatar>
                    <ListItemText primary={`+${conversation.to}`} secondary={lastMessage.message} className={classes.messagePreview} />
                  </ListItem>
                );
              }
              return '';
            })}
          </List>
        );
      }

      return (
        <React.Fragment>
          <Hidden mdUp>
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              classes={{
                paper: classes.drawerPaper,
              }}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile.
              }}
            >
              <Button
                style={newConversation ? { backgroundColor: theme.palette.error.main } : { backgroundColor: theme.palette.secondary.main }}
                onClick={newConversationClick}
                variant="contained"
                color="inherit"
              >
                {newConversation ? 'Cancel' : 'New Message'}
              </Button>
              {list}
            </Drawer>
          </Hidden>
          <Hidden smDown implementation="css">
            <Drawer
              variant="permanent"
              open
              classes={{
                paper: classes.drawerPaper,
              }}
            >
              <Button
                style={newConversation ? { backgroundColor: theme.palette.error.main } : { backgroundColor: theme.palette.secondary.main }}
                onClick={newConversationClick}
                variant="contained"
                color="inherit"
              >
                {newConversation ? 'Cancel' : 'New Message'}
              </Button>
              {list}
            </Drawer>
          </Hidden>
        </React.Fragment>
      );
    }
}

ConversationList.defaultProps = {
  conversationList: [],
  selectedConvo: null,
  newConversation: false,
};

ConversationList.propTypes = {
  classes: PropTypes.object.isRequired,
  setConversation: PropTypes.func.isRequired,
  conversationList: PropTypes.array,
  selectedConvo: PropTypes.number,
  mobileOpen: PropTypes.bool.isRequired,
  handleDrawerToggle: PropTypes.func.isRequired,
  newConversation: PropTypes.bool,
  newConversationClick: PropTypes.func.isRequired,
};

export default withStyles(styles, { withTheme: true })(ConversationList);
