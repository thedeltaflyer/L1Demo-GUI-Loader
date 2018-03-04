import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { ipcRenderer } from 'electron';
import _ from 'lodash';
import Header from './components/Header';
import Footer from './components/Footer';
import Basic from './pages/Basic';
import Advanced from './pages/Advanced';
import About from './pages/About';
import RequiresMono from './pages/RequiresMono';
import AlertDialog from './components/AlertDialog';


export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showAlert: false,
      alertMessage: 'Alert!',
      alertButton: 'OK',
      currentPage: 'basic',
      pageLocked: false,
    };
    this.alertClosed = this.alertClosed.bind(this);
    this.alertOpen = this.alertOpen.bind(this);
    this.doOnShowAlert = this.doOnShowAlert.bind(this);
    this.doOnChangePage = this.doOnChangePage.bind(this);
    this.doOnPageLock = this.doOnPageLock.bind(this);
  }

  componentWillMount() {
    ipcRenderer.on('alert-show-message', this.doOnShowAlert);
    ipcRenderer.on('change-page', this.doOnChangePage);
    ipcRenderer.on('locked-page', this.doOnPageLock);
    ipcRenderer.send('request-mainprocess-check-requirements');
  }

  componentWillUnmount() {
    ipcRenderer.removeListener('alert-show-message', this.doOnShowAlert);
    ipcRenderer.removeListener('change-page', this.doOnChangePage);
    ipcRenderer.removeListener('locked-page', this.doOnPageLock);
  }

  doOnShowAlert(event, arg) {
    this.alertOpen(arg);
  }

  doOnChangePage(event, arg) {
    if (!_.isEqual(this.state.currentPage, arg)) {
      this.setState({ currentPage: arg });
    }
  }

  doOnPageLock(event, arg) {
    if (!_.isEqual(this.state.currentPage, arg)) {
      this.setState({ pageLocked: arg });
    }
  }

  alertClosed() {
    this.setState({ showAlert: false });
  }

  alertOpen(message) {
    this.setState({
      showAlert: true,
      alertMessage: message,
    });
  }

  render() {
    let alertDia = null;
    if (this.state.showAlert) {
      alertDia = (<AlertDialog
        callback={this.alertClosed}
        message={this.state.alertMessage}
        buttonLabel={this.state.alertButton}
      />);
    }

    let page = null;
    let showFooter = true;
    switch (this.state.currentPage) {
      case 'basic':
        page = <Basic locked={this.state.pageLocked} />;
        break;
      case 'advanced':
        page = <Advanced locked={this.state.pageLocked} />;
        break;
      case 'about':
        page = <About />;
        break;
      case 'requires_mono':
        page = <RequiresMono />;
        showFooter = false;
        break;
      default:
        page = null;
    }

    return (<MuiThemeProvider><div>
      {alertDia}
      <div style={{ overflow: 'auto', paddingBottom: '64px' }}>
        <Header />
        {page}
      </div>
      {showFooter ? <Footer currentPage={this.state.currentPage} /> : null}
    </div>
    </MuiThemeProvider>);
  }
}
