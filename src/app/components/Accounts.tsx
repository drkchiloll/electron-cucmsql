import * as React from 'react';
import { Component, PropTypes } from 'react';
import {
  Drawer, MenuItem, Dialog, FlatButton,
  BottomNavigation, BottomNavigationItem,
  FontIcon, Paper, Divider, TextField,
  Subheader, List, ListItem, makeSelectable,
  SelectField
} from 'material-ui';
let SelectableList = makeSelectable(List);

export class Accounts extends React.Component<any,any> {
  constructor() {
    super();
    this.state = {
      accounts: null,
      openAccounts: false,
      selectedAcct: 0,
      version: '8.0'
    };
    this.handleAccountsToggle = this.handleAccountsToggle.bind(this);
    this.changeAcctValues = this.changeAcctValues.bind(this);
  }
  componentWillMount() {
    let accounts:Array<any> = [{
      name: 'Sandbox',
      host: 'hq-cucm-pub.abc.inc',
      version: '10.5',
      username: 'administrator',
      password: 'ciscopsdt'
    }, {
      name: 'ATC',
      host: '10.255.32.11',
      version: '11.5',
      username: 'womacks',
      password: 'password'
    }];
    this.setState({ accounts });
  }
  handleAccountsToggle() {
    this.setState({ openAccounts: !this.state.openAccounts });
  }
  changeAcctValues(e, val) {
    let { name } = e.target,
        accounts = this.state.accounts,
        selectedAcct = this.state.selectedAcct;
    accounts[selectedAcct][name] = val;
    this.setState({ accounts });
  }
  render() {
    const style = { marginLeft: 20 };
    const actions = [
      <FlatButton
        label='Save'
        icon={<FontIcon className='fa fa-hdd-o' />}
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.props.acctClose}
      />,
      <FlatButton
        label='Test'
        icon={<FontIcon className='fa fa-plug' />}
        primary={true}
        onTouchTap={this.props.acctClose}
      />,
      <FlatButton
        label='Close'
        icon={<FontIcon color='red' className='fa fa-window-close-o'/>}
        primary={true}
        onTouchTap={this.props.acctClose}
      />
    ];
    return (
      <Dialog
        actions={actions}
        modal={false}
        open={this.props.openDia}
        onRequestClose={this.props.acctClose}>
        <div>
          <Drawer open={true} width={225}>
            <SelectableList value={this.state.selectedAcct}
              onChange={(e:any) => {
                let accounts = this.state.accounts,
                    acctName = $(e.target).text();
                this.setState({
                  selectedAcct: accounts.findIndex(acct=> acct.name===acctName)
                });
              }} >
              <Subheader>Account List</Subheader>
              {
                this.state.accounts.map((acct, i) => {
                  return (
                    <ListItem
                      key={`acct_${i}`}
                      value={i}
                      primaryText={acct.name}/>
                  );
                })
              }
            </SelectableList>
            <div>
              <Paper zDepth={1}>
                <BottomNavigation
                  style={{ position:'fixed', bottom: 0 }}>
                  <BottomNavigationItem
                    label="Account"
                    icon={<FontIcon className='fa fa-user-plus'/>}
                    onTouchTap={()=>{
                      console.log('add account');
                      let accounts = this.state.accounts;
                      accounts.push({
                        name:'New Account', host:'',
                        version:'8.5', username:'',
                        password:''
                      });
                      this.setState({
                        accounts,
                        selectedAcct: accounts.length - 1
                      })
                    }}
                  />
                  <BottomNavigationItem
                    label="Remove"
                    icon={<FontIcon color='red' className='fa fa-trash'/>}
                    onTouchTap={()=>{
                      console.log('remove touched');
                      let accounts = this.state.accounts,
                          acctIdx = this.state.selectedAcct;
                      accounts.splice(acctIdx, 1);
                      if(accounts.length === 0) {
                        accounts.push({
                          name:'New Account',host:'',version:'8.0',
                          username:'',password:''
                        })
                      }
                      this.setState({
                        selectedAcct: 0,
                        accounts
                      });
                    }}
                  />
                </BottomNavigation>
              </Paper>
            </div>
          </Drawer>
        </div>
        <div style={{marginLeft:'235px'}}>
          <Paper zDepth={2}>
            <TextField hintText="Connection Name"
              style={style}
              name='name'
              underlineShow={true}
              floatingLabelFixed={true}
              floatingLabelText='Account Name'
              value={this.state.accounts[this.state.selectedAcct].name}
              onChange={this.changeAcctValues}
              errorText='' />
            <TextField
              hintText="Hostname/IP Address"
              style={style}
              name='host'
              underlineShow={false}
              floatingLabelFixed={true}
              floatingLabelText='CUCM Server'
              value={this.state.accounts[this.state.selectedAcct].host}
              onChange={this.changeAcctValues} />
            <Divider />
            <SelectField floatingLabelText='UCM Version'
              style={style}
              value={this.state.accounts[this.state.selectedAcct].version}
              onChange={(e,i,val) => (this.setState({ version: val }))} >
              {['8.0','8.5','9.0','9.1','10.0','10.5','11.0','11.5'].map((ver,i) => {
                return <MenuItem value={ver} key={`version_${i}`} primaryText={ver} />
              })}
            </SelectField>
            <TextField
              hintText="user_name"
              style={style}
              name='username'
              underlineShow={false}
              floatingLabelFixed={true}
              floatingLabelText='UserName'
              value={this.state.accounts[this.state.selectedAcct].username}
              onChange={this.changeAcctValues} />
            <TextField
              type='password'
              hintText="password"
              name='password'
              style={style}
              underlineShow={false}
              floatingLabelFixed={true}
              floatingLabelText='Password'
              value={this.state.accounts[this.state.selectedAcct].password}
              onChange={this.changeAcctValues} />
            <Divider />
          </Paper>
        </div>
      </Dialog>
    );
  }
}