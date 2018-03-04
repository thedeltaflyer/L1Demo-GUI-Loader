import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import TextField from 'material-ui/TextField';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import { ipcRenderer } from 'electron';
import { getLastRun } from '../helpers/program';


class AdvancedConsole extends Component {
  constructor(props) {
    super(props);
    this.state = {
      exitCode: null,
      stdOut: '',
      stdErr: '',
      stdOutRef: null,
    };
    this.doOnLastRun = this.doOnLastRun.bind(this);
    this.doOnStdOut = this.doOnStdOut.bind(this);
    this.doOnStdErr = this.doOnStdErr.bind(this);
    this.doOnExitCode = this.doOnExitCode.bind(this);
    this.doOnNewStart = this.doOnNewStart.bind(this);
    this.setStdOutRef = this.setStdOutRef.bind(this);
  }

  componentWillMount() {
    ipcRenderer.on('last-runtime', this.doOnLastRun);
    ipcRenderer.on('advanced-stdout', this.doOnStdOut);
    ipcRenderer.on('advanced-stderr', this.doOnStdErr);
    ipcRenderer.on('advanced-exit-code', this.doOnExitCode);
    ipcRenderer.on('advanced-new-start', this.doOnNewStart);
    getLastRun();
  }

  componentWillUnmount() {
    ipcRenderer.removeListener('last-runtime', this.doOnLastRun);
    ipcRenderer.removeListener('advanced-stdout', this.doOnStdOut);
    ipcRenderer.removeListener('advanced-stderr', this.doOnStdErr);
    ipcRenderer.removeListener('advanced-exit-code', this.doOnExitCode);
    ipcRenderer.removeListener('advanced-new-start', this.doOnNewStart);
  }

  setStdOutRef(ref) {
    this.setState({ stdOutRef: ref });
  }

  doOnLastRun(event, arg) {
    this.setState({
      exitCode: arg.exit,
      stdOut: arg.stdout.trim(),
      stdErr: arg.stderr.trim(),
    });
  }

  doOnStdOut(event, arg) {
    let stdout = this.state.stdOut;
    stdout += arg;
    const stdOutRef = this.state.stdOutRef;
    stdOutRef.input.refs.input.scrollTop = stdOutRef.input.refs.input.scrollHeight;
    this.setState({ stdOut: stdout });
  }

  doOnStdErr(event, arg) {
    let stderr = this.state.stdErr;
    stderr += arg;
    this.setState({ stdOut: stderr });
  }

  doOnExitCode(event, arg) {
    const stdOutRef = this.state.stdOutRef;
    stdOutRef.input.refs.input.scrollTop = stdOutRef.input.refs.input.scrollHeight;
    this.setState({ exitCode: arg });
  }

  doOnNewStart() {
    this.setState({
      exitCode: null,
      stdOut: '',
      stdErr: '',
    });
  }

  render() {
    const cardStyle = {
      width: '80%',
      margin: 'auto',
      marginTop: '20px',
      marginBottom: '10px',
    };

    const textFieldStyle = {
      marginLeft: 20,
      marginRight: 40,
    };

    return (<div>
      <Paper
        zDepth={1}
        style={cardStyle}
      >
        <Subheader>StdOut:</Subheader>
        <Divider />
        <div style={textFieldStyle} >
          <TextField
            value={this.state.stdOut}
            style={textFieldStyle}
            id="adv_stdout"
            ref={this.setStdOutRef}
            underlineShow={false}
            multiLine
            fullWidth
            rows={15}
            rowsMax={15}
            onChange={this.scrollAreaDown}
          />
        </div>
        <Divider />
        <Subheader>StdErr:</Subheader>
        <Divider />
        <div style={textFieldStyle} >
          <TextField
            value={this.state.stdErr.length > 0 ? this.state.stdErr : 'N/A'}
            style={textFieldStyle}
            id="adv_stderr"
            underlineShow={false}
            multiLine
            fullWidth
            rows={1}
            rowsMax={15}
            onChange={this.scrollAreaDown}
          />
        </div>
        <Divider />
        <Subheader>Exit Code:</Subheader>
        <Divider />
        <div style={textFieldStyle} >
          <TextField
            value={this.state.exitCode != null ? `${this.state.exitCode}` : 'N/A'}
            style={textFieldStyle}
            id="adv_exitcode"
            underlineShow={false}
            multiLine
            fullWidth
            rows={1}
            rowsMax={5}
            onChange={this.scrollAreaDown}
          />
        </div>
      </Paper>
    </div>);
  }
}

export default AdvancedConsole;
