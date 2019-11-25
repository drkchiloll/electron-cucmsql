import * as React from 'react'
import {
  Tabs, Tab, Drawer,
  RefreshIndicator, IconButton
} from 'material-ui';
import ReloadIcon from 'material-ui/svg-icons/av/loop';
import CloseIcon from 'material-ui/svg-icons/navigation/close';
// Import Components
import { Accounts, QueryWindow } from './index';
import { startUpdate, Updator } from '../lib/updator';
import { ipcRenderer } from 'electron';

export class App extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      tabValue: 'mainView',
      openAcct: false,
      tabIndx: 1,
      accountName: null,
      update: false,
      updateDrawer: false,
      updated: false,
      didUpdate: false,
      message: 'Updating...'
    };

    ipcRenderer.on('update', this.handleUpdate);
  }

  handleUpdate = (event, version) => {
    this.setState({ update: true });
    setTimeout(() => this.setState({updateDrawer: true}), 0);
    let message: string;
    startUpdate().then(didUpdate => {
      if(didUpdate) {
        message = `You have been updated to: ${Updator.version}`;
      } else {
        message = 'There are currently no updates available.';
      }
      this.setState({
        updated: true,
        didUpdate,
        message
      });
    });
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
    const {
      update, updated, message,
      didUpdate, updateDrawer,
      accountName, tabValue,
      tabIndx, openAcct
    } = this.state;
    return (
      <div>
        <div style={{display: update ? 'inline-block' : 'none '}}>
          <Drawer open={updateDrawer} openSecondary={true}
            width={475}
            containerStyle={{
              position: 'absolute',
              top: 0,
              height: 80,
              border: '1px solid black',
              borderRadius: '6px',
              right: update ? window.innerWidth / 3.3 : -1
            }} >
            <h4 style={{ marginLeft: '35px', width: 300 }} >
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
                    top: 3,
                    left: 350
                  }} >
                  <ReloadIcon style={{height: 20, width: 20}} />
                </IconButton> :
              !updated ?
                <RefreshIndicator size={20} loadingColor='black'
                  status='loading'
                  top={18}
                  left={420} /> :
              updated && !didUpdate ?
                <IconButton onClick={this.closeUpdator}
                  style={{
                    position: 'absolute',
                    top: 3,
                    right: 30
                  }}
                  iconStyle={{ height: 20, width: 20 }}
                  tooltip='close'
                  tooltipPosition='bottom-left'
                  tooltipStyles={{ top: 25 }} >
                  <CloseIcon color='red' />
                </IconButton> :
                null
            }
          </Drawer>
        </div>
        <div style={{ width: 280 }}>
          <Tabs className='tabs-container'
            inkBarStyle={{ background: 'rgb(140,20,17)' }}
            tabItemContainerStyle={{ width: 280 }}
            initialSelectedIndex={tabIndx}
            value={tabValue}
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
                openDia={openAcct}
                acctClose={this.handleClose}
                accountName={(name) =>
                  this.setState({ accountName: name })} />
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
              value='mainView'
            >
              <QueryWindow view={tabValue} accountName={accountName} />
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
      didUpdate: false,
      updateDrawer: false
    })
  }
}
