import React from 'react';
import { PropTypes } from 'prop-types';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import InfoIcon from 'material-ui/svg-icons/action/info-outline';


class AlertDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: true,
    };
    this.handleClose = this.handleClose.bind(this);
  }

  handleClose() {
    this.setState({ open: false });
    this.props.callback();
  }

  render() {
    const actions = [
      <FlatButton
        label={this.props.buttonLabel}
        primary
        onClick={this.handleClose}
      />,
    ];

    const title = (<div style={{ display: 'inline-block' }}>
      <InfoIcon style={{ verticalAlign: 'middle' }} />
      <span style={{ display: 'inline-block', verticalAlign: 'middle' }}> Info</span>
    </div>);

    return (
      <Dialog
        actions={actions}
        title={title}
        modal={false}
        open={this.state.open}
        onRequestClose={this.handleClose}
      >
        {this.props.message}
      </Dialog>
    );
  }
}

AlertDialog.defaultProps = {
  buttonLabel: 'OK',
  message: 'Alert!',
  callback: () => {},
};

AlertDialog.propTypes = {
  buttonLabel: PropTypes.string,
  message: PropTypes.string,
  callback: PropTypes.func,
};

export default AlertDialog;