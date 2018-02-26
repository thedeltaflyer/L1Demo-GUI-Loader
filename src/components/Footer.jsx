import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { BottomNavigation, BottomNavigationItem } from 'material-ui/BottomNavigation';
import Paper from 'material-ui/Paper';
import IconBasic from 'material-ui/svg-icons/action/compare-arrows';
import IconAdvanced from 'material-ui/svg-icons/action/build';
import IconAbout from 'material-ui/svg-icons/action/info-outline';
import { ipcRenderer } from 'electron';
import _ from 'lodash';


const advancedIcon = <IconAdvanced />;
const aboutIcon = <IconAbout />;
const basicIcon = <IconBasic />;

const getIndexFor = (mode) => {
  switch (mode) {
    case 'basic':
      return 0;
    case 'advanced':
      return 1;
    case 'about':
      return 2;
    default:
      return -1;
  }
};

const goToPage = (name) => {
  ipcRenderer.send('request-change-page', name);
}

class Footer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: 0,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props, nextProps)) {
      this.setState({ selectedIndex: getIndexFor(nextProps.currentPage) });
    }
  }

  render() {
    return (
      <Paper zDepth={1} style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <BottomNavigation selectedIndex={this.state.selectedIndex}>
          <BottomNavigationItem
            label="Basic"
            icon={basicIcon}
            onClick={() => goToPage('basic')}
          />
          <BottomNavigationItem
            label="Advanced"
            icon={advancedIcon}
            onClick={() => goToPage('advanced')}
          />
          <BottomNavigationItem
            label="About"
            icon={aboutIcon}
            onClick={() => goToPage('about')}
          />
        </BottomNavigation>
      </Paper>
    );
  }
}

Footer.propTypes = {
  currentPage: PropTypes.string,
};

Footer.defaultProps = {
  currentPage: 'basic',
};

export default Footer;
