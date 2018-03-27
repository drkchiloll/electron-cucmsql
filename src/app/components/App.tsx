import * as React from 'react'
import {
  Tabs, Tab, FontIcon,
  Dialog, FlatButton, Drawer,
  RefreshIndicator, IconButton
} from 'material-ui';
import ReloadIcon from 'material-ui/svg-icons/av/loop';
import CloseIcon from 'material-ui/svg-icons/navigation/close';
// Import Components
import { Accounts, QueryWindow } from './index';
import { Updator } from '../lib/update';
import { ipcRenderer } from 'electron';

export class App extends React.Component<any, any> {
  constructor() {
    super();
    this.state = {
      tabValue: 'mainView',
      openAcct: false,
      tabIndx: 1,
      accountName: null,
      update: false,
      updated: false,
      didUpdate: false,
      message: 'Updating...'
    };
  }

  componentDidMount() {
    ipcRenderer.on('update', this.handleUpdate);
  }

  handleUpdate = () => {
    Updator.init();
    this.setState({ update: true });
    Updator.startUpdate().then((didUpdate) => {
      if(didUpdate) {
        this.setState({
          updated: true,
          didUpdate: true,
          message: 'Done..Reload',
        });
      } else {
        this.setState({
          updated: true,
          didUpdate: false,
          message: 'You have the latest Version'
        });
      }
    })
  }

  handleClose = () => {
    this.setState({
      openAcct: false,
      tabIdx: 1,
      tabValue: 'mainView'
    });
  }

  _tabSelect = (tabValue: string) => {
    let saveQuery = false;
    if(tabValue === 'save') saveQuery = true;
    this.setState({
      openAcct: tabValue === 'accts' ? true : false,
      tabValue,
      saveQuery
    });
  }

  styles: any = {
    font: { fontSize: '80%' }
  }

  render() {
    const { update, updated, message, didUpdate } = this.state;
    return (
      <div>
        <Drawer open={update} openSecondary={true}
          width={375}
          containerStyle={{
            position: 'absolute',
            top: 0,
            height: 85,
            border: '1px solid black',
            borderRadius: '6px',
            right: update ? window.innerWidth / 2.8 : -1
          }} >
          <h4 style={{ marginLeft: '35px', width: 195 }} >
            { message }
          </h4>
          {
            updated && didUpdate ?
              <IconButton onClick={() => window.location.reload()}
                tooltip='reload'
                tooltipPosition='bottom-center'
                tooltipStyles={{ top: 25 }}
                style={{
                  position: 'absolute',
                  top: 8,
                  left: 270
                }} >
                <ReloadIcon />
              </IconButton> :
            !updated ?
              <RefreshIndicator size={20} loadingColor='black'
                status='loading'
                top={18}
                left={260} /> :
            updated && !didUpdate ?
              <IconButton onClick={this.closeUpdator}
                style={{
                  position: 'absolute',
                  top: 5,
                  right: 10
                }}
                iconStyle={{ height: 20, width: 20 }}
                tooltip='close'
                tooltipPosition='bottom-left'
                tooltipStyles={{ top: 25 }} >
                <CloseIcon />
              </IconButton> :
              null
          }
        </Drawer>
        <QueryWindow view={this.state.tabValue} accountName={this.state.accountName} />
        <div style={{ width: 280 }}>
          <Tabs className='tabs-container'
            inkBarStyle={{ background: 'rgb(140,20,17)' }}
            tabItemContainerStyle={{ width: 280 }}
            initialSelectedIndex={this.state.tabIndx}
            value={this.state.tabValue}
            onChange={this._tabSelect}>
            <Tab
              icon={
                <span className='fa-stack fa-lg' >
                  <i className='fa fa-server fa-stack-2x' />
                </span>
              }
              style={this.styles.font}
              label='Accounts'
              value='accts'>
              <Accounts
                openDia={this.state.openAcct}
                acctClose={this.handleClose}
                accountName={(name) => this.setState({ accountName: name })} />
            </Tab>
            <Tab
              style={this.styles.font}
              icon={
                <span className="fa-stack fa-lg">
                  <i className="fa fa-database fa-stack-2x fa-inverse" />
                  <i className="fa fa-picture-o fa-stack-1x"
                    style={{ margin: '10px 0 0 15px' }} />
                </span>
              }
              label='SQL View'
              value='mainView'>
            </Tab>
          </Tabs>
        </div>
      </div>
    );
  }
  closeUpdator = () => {
    this.setState({
      update: false,
      updated: false,
      didUpdate: false
    })
  }
}
