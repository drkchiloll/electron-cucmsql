import * as React from 'react'
import * as $ from 'jquery';
import {
  Tabs, Tab, FontIcon, Dialog,
  FlatButton
} from 'material-ui';

// Import Components
import {
  Accounts, QueryWindow
} from './index';

export class App extends React.Component<any, any> {
  constructor() {
    super();
    this.state = {
      tabValue: 'mainView',
      openAcct: false,
      tabIndx: 1,
      accountName: null
    };
    this.handleClose = this.handleClose.bind(this);
    this._tabSelect = this._tabSelect.bind(this);
  }
  handleClose() {
    this.setState({
      openAcct: false,
      tabIdx: 1,
      tabValue: 'mainView'
    });
  }
  _tabSelect(tabValue: string) {
    let saveQuery = false;
    if(tabValue === 'save') saveQuery = true;
    this.setState({
      openAcct: tabValue === 'accts' ? true : false,
      tabValue,
      saveQuery
    });
  }
  render() {
    return (
      <div>
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
              label='Accounts'
              value='accts'>
              <Accounts
                openDia={this.state.openAcct}
                acctClose={this.handleClose}
                accountName={(name) => this.setState({ accountName: name })} />
            </Tab>
            <Tab
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
}
