import React from 'react';
import PropTypes from 'prop-types';
import {
  withStyles, Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button,
} from '@material-ui/core';

import { withAuth, post } from '../../../util';

const styles = {};

class AddTeamMemberDialog extends React.Component {
  state = {
    newMember: '',
  }

  handleChange = (event) => {
    // todo clear error if valid email
    this.setState({
      newMember: event.target.value,
    });
  }

  handleSubmit = async () => {
    const { addMember, handleClose, user } = this.props;
    const { newMember } = this.state;
    // todo add error if email address not valid
    handleClose();
    // call parent addMember with placeholder info
    addMember({
      email: newMember,
    });
    // call endpoint
    try {
      const validMember = await post('/team/add', user.id_token, {
        email: newMember,
      });
      console.log(validMember);
      if (validMember) {
        addMember(validMember);
      }
    } catch (e) {
      // remove member
      // show snackbar
      console.error(e);
    }
    // call parent updateMember with server sent info
  }

  render() {
    const { open, handleClose } = this.props;
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Add team member</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter the email of the user you'd like to add. Logging in using this email address will let them access this team's messages.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            onChange={this.handleChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={this.handleSubmit} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

AddTeamMemberDialog.defaultProps = {
  user: null,
};
AddTeamMemberDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  user: PropTypes.object,
  addMember: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default withAuth(withStyles(styles)(AddTeamMemberDialog));
