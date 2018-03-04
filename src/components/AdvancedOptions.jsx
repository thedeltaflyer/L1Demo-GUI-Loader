import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Paper from 'material-ui/Paper';
import { Card, CardActions, CardTitle, CardText } from 'material-ui/Card';
import AutoComplete from 'material-ui/AutoComplete';
import TextField from 'material-ui/TextField';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';
import { ipcRenderer } from 'electron';
import _ from 'lodash';
import { killProgram, pollForTty, pollForLastOptions } from '../helpers/program';


const setOptions = (filePath, ttyPath, deviceType, rate, flags) => {
  ipcRenderer.send('mainprocess-set-last-options', {
    filepath: filePath,
    tty: ttyPath,
    device: deviceType,
    args: flags,
    rate,
  });
};


class AdvancedOptions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listTty: [],
      ttyPath: '',
      filePath: '',
      deviceType: '',
      rate: '',
      flags: [
        '--writef',
        '-o',
      ],
    };
    this.doOnGetTty = this.doOnGetTty.bind(this);
    this.startProgram = this.startProgram.bind(this);
    this.selectFile = this.selectFile.bind(this);
    this.handleTtyUpdate = this.handleTtyUpdate.bind(this);
    this.handleRateUpdate = this.handleRateUpdate.bind(this);
    this.handleDeviceUpdate = this.handleDeviceUpdate.bind(this);
    this.handleFlagUpdate = this.handleFlagUpdate.bind(this);
    this.handleRemoveFlag = this.handleRemoveFlag.bind(this);
    this.handleNewFlag = this.handleNewFlag.bind(this);
    this.checkIfReady = this.checkIfReady.bind(this);
    this.doOnGetOptions = this.doOnGetOptions.bind(this);
  }

  componentWillMount() {
    ipcRenderer.on('mainprocess-response-get-tty-adv', this.doOnGetTty);
    ipcRenderer.on('mainprocess-response-last-options', this.doOnGetOptions);
    pollForTty(true);
    pollForLastOptions();
  }

  componentWillUnmount() {
    ipcRenderer.removeListener('mainprocess-response-get-tty-adv', this.doOnGetTty);
    ipcRenderer.removeListener('mainprocess-response-last-options', this.doOnGetOptions);
  }

  doOnGetTty(event, arg) {
    if (!_.isEqual(arg, this.state.listTty)) {
      this.setState({ listTty: arg });
    }
  }

  doOnGetOptions(event, arg) {
    const newState = {
      filePath: arg.filepath || this.state.filePath,
      ttyPath: arg.tty || this.state.ttyPath,
      deviceType: arg.device || this.state.deviceType,
      rate: arg.rate || this.state.rate,
      flags: arg.args || this.state.flags,
    };

    this.setState(newState);
  }

  startProgram() {
    ipcRenderer.send('request-mainprocess-program', {
      tty: this.state.ttyPath,
      filepath: this.state.filePath,
      device: this.state.deviceType,
      rate: this.state.rate,
      flags: this.state.flags,
      advanced: true,
    });
  }

  selectFile(event) {
    if (event.target.value.length === 0) {
      this.setState({ filePath: '' });
      setOptions('',
        this.state.ttyPath,
        this.state.deviceType,
        this.state.rate,
        this.state.flags);
    } else {
      this.setState({ filePath: event.target.files[0].path });
      setOptions(event.target.files[0].path,
        this.state.ttyPath,
        this.state.deviceType,
        this.state.rate,
        this.state.flags);
    }
  }

  handleTtyUpdate(value) {
    setOptions(this.state.filePath,
      value,
      this.state.deviceType,
      this.state.rate,
      this.state.flags);
    this.setState({ ttyPath: value });
  }

  handleRateUpdate(value) {
    setOptions(this.state.filePath,
      this.state.ttyPath,
      this.state.deviceType,
      value,
      this.state.flags);
    this.setState({ rate: value });
  }

  handleDeviceUpdate(value) {
    setOptions(this.state.filePath,
      this.state.ttyPath,
      value,
      this.state.rate,
      this.state.flags);
    this.setState({ deviceType: value });
  }

  handleFlagUpdate(value, index) {
    const nextFlags = this.state.flags;
    nextFlags[index] = value;
    setOptions(this.state.filePath,
      this.state.ttyPath,
      this.state.deviceType,
      this.state.rate,
      nextFlags);
    this.setState({ flags: nextFlags });
  }

  handleRemoveFlag(index) {
    const nextFlags = this.state.flags;
    nextFlags.splice(index, 1);
    setOptions(this.state.filePath,
      this.state.ttyPath,
      this.state.deviceType,
      this.state.rate,
      nextFlags);
    this.setState({ flags: nextFlags });
  }

  handleNewFlag() {
    const nextFlags = this.state.flags;
    nextFlags.push('');
    setOptions(this.state.filePath,
      this.state.ttyPath,
      this.state.deviceType,
      this.state.rate,
      nextFlags);
    this.setState({ flags: nextFlags });
  }

  checkIfReady() {
    const state = this.state;
    return (state.filePath.length > 0 &&
      state.ttyPath.length > 0 &&
      state.rate.length > 0 &&
      state.deviceType.length > 0);
  }

  render() {
    const flagLength = this.state.flags.length;

    const cardStyle = {
      width: '80%',
      margin: 'auto',
      marginTop: '20px',
      marginBottom: '10px',
    };

    const flagFieldStyle = {
      marginLeft: 20,
    };

    const programButton = (<RaisedButton
      label={this.props.locked ? 'Kill' : 'Start'}
      fullWidth
      backgroundColor={this.props.locked ? '#ff6633' : '#a4c639'}
      onClick={this.props.locked ? killProgram : this.startProgram}
      disabled={!this.checkIfReady()}
    />);

    const flags = this.state.flags.map((value, index) => {
      const key = `option_flag_${flagLength}_${index}`;
      return (<div key={key} >
        <div style={{ display: 'flex', justifyContent: 'space-between' }} >
          <TextField
            defaultValue={value}
            hintText="Option"
            style={flagFieldStyle}
            underlineShow={false}
            onChange={(event) => { this.handleFlagUpdate(event.target.value, index); }}
            disabled={this.props.locked}
            fullWidth
          />
          <div>
            <RaisedButton
              style={{ marginRight: 0 }}
              label="-"
              onClick={() => { this.handleRemoveFlag(index); }}
              disabled={this.props.locked}
            />
          </div>
        </div>
        <Divider />
      </div>);
    });

    return (<Card style={cardStyle} >
      <CardTitle
        title="Advanced Hex Uploader"
        subtitle="Set available settings and hit Start to begin!"
      />
      <CardText>
        <FlatButton
          containerElement="label"
          labelPosition="before"
          label="File:"
          style={{ width: '100%', display: 'grid' }}
        >
          <input
            type="file"
            onChange={this.selectFile}
            id="file-asm-path"
            disabled={this.props.locked}
          />
        </FlatButton>
        <Divider />
        <AutoComplete
          floatingLabelText="TTY Device"
          hintText="/dev/usbTTY"
          searchText={this.state.ttyPath}
          dataSource={this.state.listTty}
          filter={AutoComplete.caseInsensitiveFilter}
          maxSearchResults={5}
          onFocus={() => pollForTty(true)}
          disabled={this.props.locked}
          onUpdateInput={this.handleTtyUpdate}
          fullWidth
        />
        <AutoComplete
          floatingLabelText="Rate"
          hintText="115200"
          searchText={this.state.rate}
          dataSource={['115200']}
          disabled={this.props.locked}
          onUpdateInput={this.handleRateUpdate}
          fullWidth
        />
        <AutoComplete
          floatingLabelText="Device"
          hintText="pic24fj256da206"
          searchText={this.state.deviceType}
          dataSource={['pic24fj256da206']}
          disabled={this.props.locked}
          onUpdateInput={this.handleDeviceUpdate}
          fullWidth
        />
        <Subheader>Other Options:</Subheader>
        <Paper zDepth={2}>
          {flags}
          <RaisedButton
            label="+"
            onClick={this.handleNewFlag}
            disabled={this.props.locked}
          />
        </Paper>
      </CardText>
      <CardActions>
        {programButton}
      </CardActions>
    </Card>);
  }
}

AdvancedOptions.propTypes = {
  locked: PropTypes.bool,
};

AdvancedOptions.defaultProps = {
  locked: false,
};

export default AdvancedOptions;
