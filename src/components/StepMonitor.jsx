import React from 'react';
import PropTypes from 'prop-types';
import { Step, Stepper, StepLabel } from 'material-ui/Stepper';
import CircularProgress from 'material-ui/CircularProgress';
import IconDone from 'material-ui/svg-icons/action/done';
import IconError from 'material-ui/svg-icons/alert/error';


class StepMonitor extends React.Component {
  render() {
    const { step } = this.props;

    let progress01 = null;
    let progress02 = null;
    let progress03 = null;

    switch (step) {
      case 1:
        progress01 = !this.props.failed ? <CircularProgress /> : <IconError color="red" />;
        break;
      case 2:
        progress01 = <IconDone color="green" />;
        progress02 = !this.props.failed ? <CircularProgress /> : <IconError color="red" />;
        break;
      case 3:
        progress01 = <IconDone color="green" />;
        progress02 = <IconDone color="green" />;
        progress03 = !this.props.failed ? <CircularProgress /> : <IconError color="red" />;
        break;
      case 4:
        progress01 = <IconDone color="green" />;
        progress02 = <IconDone color="green" />;
        progress03 = <IconDone color="green" />;
        break;
      default:
        break;
    }

    return (
      <div style={{ width: '100%', maxWidth: 700, margin: 'auto' }}>
        <Stepper activeStep={step - 1}>
          <Step>
            <StepLabel icon={progress01}>Verifying Hex</StepLabel>
          </Step>
          <Step>
            <StepLabel icon={progress02}>Loading Hex</StepLabel>
          </Step>
          <Step>
            <StepLabel icon={progress03}>Writing Hex</StepLabel>
          </Step>
        </Stepper>
      </div>
    );
  }
}

StepMonitor.propTypes = {
  step: PropTypes.number,
  failed: PropTypes.bool,
};

StepMonitor.defaultProps = {
  step: 0,
  failed: false,
};

export default StepMonitor;
