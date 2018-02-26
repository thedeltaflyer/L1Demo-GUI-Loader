import React from 'react';
import PropTypes from 'prop-types';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import { Card, CardActions, CardTitle, CardText } from 'material-ui/Card';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import { ipcRenderer } from 'electron';
import _ from 'lodash';

class StepSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      deviceSelected: null,
      devicesAvailable: [],
      deviceReady: false,
      hexPath: '',
      hexReady: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.validateFileType = this.validateFileType.bind(this);
    this.pollForTty = this.pollForTty.bind(this);
    this.doOnGetTty = this.doOnGetTty.bind(this);
    this.startProgram = this.startProgram.bind(this);
  }

  componentWillMount() {
    ipcRenderer.on('mainprocess-response-get-tty', this.doOnGetTty);
    this.pollForTty();
  }

  componentWillUnmount() {
    ipcRenderer.removeListener('mainprocess-response-get-tty', this.doOnGetTty);
  }

  handleChange(event, index, value) {
    this.setState({
      deviceSelected: value,
      deviceReady: value > 0 && this.state.devicesAvailable.length > 0,
    });
  }

  validateFileType(event) {
    if (event.target.value.length === 0) {
      this.setState({ hexPath: '', hexReady: false });
      return;
    }
    const ext = event.target.value.match(/\.([^\.]+)$/)[1];
    // console.log(event.target.files[0].path);
    switch (ext) {
      case 'hex':
        // allowed
        this.setState({ hexPath: event.target.files[0].path, hexReady: true });
        break;
      default:
        // not allowed
        // alert('This program can only upload .hex files!');
        ipcRenderer.send('request-alert-show-message', 'This program can only upload .hex files!');
        event.target.value = '';
        this.setState({ hexPath: '', hexReady: false });
    }
  }

  pollForTty() {
    ipcRenderer.send('request-mainprocess-get-tty');
  }

  doOnGetTty(event, arg) {
    if (!_.isEqual(arg, this.state.devicesAvailable)) {
      this.setState({
        devicesAvailable: arg,
        deviceReady: this.state.deviceSelected > 0 && arg.length > 0,
      });
    }
  }

  startProgram() {
    const selectedDevice = this.state.devicesAvailable[this.state.deviceSelected - 1];
    ipcRenderer.send('request-mainprocess-program', {
      tty: `/dev/${selectedDevice}`,
      filepath: this.state.hexPath,
      advanced: this.props.advanced,
    });
  }

  render() {
    const cardStyle = {
      width: '80%',
      margin: 'auto',
      marginTop: '20px',
      marginBottom: '10px',
    };

    const menuItems = [];
    this.state.devicesAvailable.forEach((name, index) => {
      menuItems.push(
        <MenuItem
          value={index + 1}
          primaryText={name}
          key={'device_choice_{name}'}
        />);
    });

    const programButton = (<RaisedButton
      label="Program"
      disabled={!(this.state.hexReady && this.state.deviceReady) || this.props.locked}
      fullWidth
      backgroundColor="#a4c639"
      onClick={this.startProgram}
    />);

    let render = null;
    if (this.props.advanced) {
      render = null;
    } else {
      // render = (<Paper style={paperStyle}>
      //   <FlatButton containerElement="label" >
      //     <input type="file" />
      //   </FlatButton>
      //   <br />
      //   <TextField
      //     hintText="Browse..."
      //     floatingLabelText="Hex File"
      //   />
      // </Paper>);
      render = (<Card style={cardStyle}>
        <CardTitle
          title="Basic Hex Uploader"
          subtitle="Choose your device and Hex file to begin!"
        />
        <CardText>
          <SelectField
            floatingLabelText="Device"
            value={this.state.deviceSelected}
            onChange={this.handleChange}
            onClick={this.pollForTty}
            style={{ margin: 'auto', marginTop: '-20px', width: '50%', display: 'grid' }}
            disabled={this.props.locked}
          >
            {menuItems}
          </SelectField>
          <br />
          <br />
          <FlatButton
            containerElement="label"
            labelPosition="before"
            label="Hex File:"
            style={{ margin: 'auto', marginLeft: 'auto', width: '60%', display: 'grid' }}
          >
            <input
              type="file"
              accept=".hex, application/vnd.oipf.cspg-hexbinary"
              onChange={this.validateFileType}
              id="file-asm-path"
              disabled={this.props.locked}
            />
          </FlatButton>
        </CardText>
        <CardActions>
          {programButton}
        </CardActions>
      </Card>);
    }
    return render;
  }
}

StepSelector.propTypes = {
  advanced: PropTypes.bool,
  locked: PropTypes.bool,
};

StepSelector.defaultProps = {
  advanced: false,
  locked: false,
};

export default StepSelector;
