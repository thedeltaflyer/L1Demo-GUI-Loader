import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AdvancedOptions from '../components/AdvancedOptions';
import AdvancedConsole from '../components/AdvancedConsole';

class Advanced extends Component {
  render() {
    return (<div>
      <AdvancedOptions locked={this.props.locked} />
      <br />
      <AdvancedConsole />
    </div>);
  }
}

Advanced.propTypes = {
  locked: PropTypes.bool,
};

Advanced.defaultProps = {
  locked: false,
};

export default Advanced;
