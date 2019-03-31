import React from 'react';
import PropTypes from 'prop-types';
import {
  withStyles, Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button,
} from '@material-ui/core';

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

  handleSubmit = () => {
    const { addMember, handleClose } = this.props;
    const { newMember } = this.state;
    // todo add error if email address not valid
    handleClose();
    // call parent addMember with placeholder info
    addMember({
      email: newMember,
    });
    // call endpoint
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

AddTeamMemberDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  addMember: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default withStyles(styles)(AddTeamMemberDialog);
