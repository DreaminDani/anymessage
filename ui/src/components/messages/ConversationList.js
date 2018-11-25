/**
 * Copyright (c) AnyMessage.io. All rights reserved. http://www.anymessage.io
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.md file.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import ImageIcon from '@material-ui/icons/Image';
import WorkIcon from '@material-ui/icons/Work';
import BeachAccessIcon from '@material-ui/icons/BeachAccess';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';

import { Typography } from '@material-ui/core';
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
        classes, selectedConvo, conversationList, mobileOpen, handleDrawerToggle,
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
                      {getIcon(lastMessage.type)}
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


      if (conversationList) {
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
                {list}
              </Drawer>
            </Hidden>
          </React.Fragment>
        );
      }
      return '';
    }
}

ConversationList.defaultProps = {
  conversationList: [],
  selectedConvo: null,
};

ConversationList.propTypes = {
  classes: PropTypes.object.isRequired,
  setConversation: PropTypes.func.isRequired,
  conversationList: PropTypes.array,
  selectedConvo: PropTypes.number,
  mobileOpen: PropTypes.bool.isRequired,
  handleDrawerToggle: PropTypes.func.isRequired,
};

export default withStyles(styles)(ConversationList);
