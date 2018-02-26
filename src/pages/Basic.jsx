import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ipcRenderer } from 'electron';
import _ from 'lodash';
import StepSelector from '../components/StepSelector';
import StepMonitor from '../components/StepMonitor';


class Basic extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStep: 0,
      hasFailed: false,
    };
    this.doOnSetStep = this.doOnSetStep.bind(this);
    this.doOnReturnCode = this.doOnReturnCode.bind(this);
  }

  componentWillMount() {
    ipcRenderer.on('basic-set-step', this.doOnSetStep);
    ipcRenderer.on('program-return-code', this.doOnReturnCode);
  }

  componentWillUnmount() {
    ipcRenderer.removeListener('basic-set-step', this.doOnSetStep);
    ipcRenderer.removeListener('program-return-code', this.doOnReturnCode);
  }

  doOnSetStep(event, arg) {
    this.setState({
      currentStep: arg,
      hasFailed: false,
    });
  }

  doOnReturnCode(event, arg) {
    console.log(arg);
    if (_.isEqual(arg, 0)) {
      this.setState({
        currentStep: 4,
        hasFailed: false,
      });
    } else {
      this.setState({
        hasFailed: true,
      });
    }
  }

  render() {
    return (<div>
      <StepSelector locked={this.props.locked} />
      <br />
      <StepMonitor step={this.state.currentStep} failed={this.state.hasFailed} />
    </div>);
  }
}

Basic.propTypes = {
  locked: PropTypes.bool,
};

Basic.defaultProps = {
  locked: false,
};

export default Basic;
