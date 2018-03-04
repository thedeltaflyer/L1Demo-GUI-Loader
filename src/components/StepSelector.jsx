import React from 'react';
import PropTypes from 'prop-types';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import { Card, CardActions, CardTitle, CardText } from 'material-ui/Card';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import { ipcRenderer } from 'electron';
import _ from 'lodash';
import { pollForTty, pollForLastOptions } from '../helpers/program';

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
    this.doOnGetTty = this.doOnGetTty.bind(this);
    this.doOnGetOptions = this.doOnGetOptions.bind(this);
    this.setOptions = this.setOptions.bind(this);
    this.startProgram = this.startProgram.bind(this);
  }

  componentWillMount() {
    ipcRenderer.on('mainprocess-response-get-tty', this.doOnGetTty);
    ipcRenderer.on('mainprocess-response-last-options', this.doOnGetOptions);
    pollForTty();
    pollForLastOptions();
  }

  componentWillUnmount() {
    ipcRenderer.removeListener('mainprocess-response-get-tty', this.doOnGetTty);
    ipcRenderer.removeListener('mainprocess-response-last-options', this.doOnGetOptions);
  }

  setOptions(hexPath, deviceSelected, deviceReady = false) {
    const selectedDevice = deviceReady ?
      this.state.devicesAvailable[deviceSelected - 1] : null;
    ipcRenderer.send('mainprocess-set-last-options', {
      filepath: hexPath,
      tty: selectedDevice ? `/dev/${selectedDevice}` : '',
    });
  }

  doOnGetTty(event, arg) {
    if (!_.isEqual(arg, this.state.devicesAvailable)) {
      this.setState({
        devicesAvailable: arg,
        deviceReady: this.state.deviceSelected > 0 && arg.length > 0,
      });
    }
  }

  doOnGetOptions(event, arg) {
    const newState = {};
    if (arg.tty) {
      const ttyName = arg.tty.replace('/dev/', '');
      const ttyDev = _.indexOf(this.state.devicesAvailable, ttyName);
      if (ttyDev >= 0) {
        newState.deviceSelected = ttyDev + 1;
        newState.deviceReady = true;
      }
    }
    if (arg.filepath) {
      newState.hexPath = arg.filepath;
      newState.hexReady = arg.filepath.length > 0;
    }
    this.setState(newState);
  }

  validateFileType(event) {
    if (event.target.value.length === 0) {
      this.setState({ hexPath: '', hexReady: false });
      return;
    }
    const ext = event.target.value.match(/\.([^.]+)$/)[1];
    // console.log(event.target.files[0].path);
    switch (ext) {
      case 'hex':
        // allowed
        this.setOptions(event.target.files[0].path,
          this.state.deviceSelected,
          this.state.deviceReady);
        this.setState({ hexPath: event.target.files[0].path, hexReady: true });
        break;
      default: {
        // not allowed
        // alert('This program can only upload .hex files!');
        ipcRenderer.send('request-alert-show-message', 'This program can only upload .hex files!');
        const target = event.target;
        target.value = '';
        this.setState({ hexPath: '', hexReady: false });
      }
    }
  }

  handleChange(event, index, value) {
    this.setOptions(this.state.hexPath,
      value,
      value > 0 && this.state.devicesAvailable.length > 0);
    this.setState({
      deviceSelected: value,
      deviceReady: value > 0 && this.state.devicesAvailable.length > 0,
    });
  }

  startProgram() {
    const selectedDevice = this.state.devicesAvailable[this.state.deviceSelected - 1];
    ipcRenderer.send('request-mainprocess-program', {
      tty: `/dev/${selectedDevice}`,
      filepath: this.state.hexPath,
      advanced: false,
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

    return (<Card style={cardStyle}>
      <CardTitle
        title="Basic Hex Uploader"
        subtitle="Choose your device and Hex file to begin!"
      />
      <CardText>
        <SelectField
          floatingLabelText="Device"
          value={this.state.deviceSelected}
          onChange={this.handleChange}
          onClick={() => pollForTty()}
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
}

StepSelector.propTypes = {
  locked: PropTypes.bool,
};

StepSelector.defaultProps = {
  locked: false,
};

export default StepSelector;
