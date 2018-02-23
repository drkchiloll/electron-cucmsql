import * as React from 'react';
import * as $ from 'jquery';
import {
  Drawer, MenuItem, Dialog, FlatButton,
  BottomNavigation, BottomNavigationItem,
  FontIcon, Paper, Divider, TextField,
  Subheader, List, ListItem, makeSelectable,
  SelectField, Snackbar
} from 'material-ui';
let SelectableList = makeSelectable(List);
import { Api, CucmSql, moment, Promise } from '../components';

export class Accounts extends React.Component<any,any> {
  constructor() {
    super();
    this.state = {
      api: null,
      accounts: null,
      openAccounts: false,
      selectedAcct: 0,
      account: null,
      openSnack: false,
      acctMsg: ''
    };
  }
  componentWillMount() {
    let accounts;
    let api = new Api({
      db: 'acctDb',
      dbName: 'accounts'
    });
    api.get().then((records:any) => {
      // console.log(records);
      if(records.length === 0) {
        accounts = [{
          name:'New Account', host:'',version:'8.5',
          username:'',password:'',selected: true
        }];
        return accounts;
      } else {
        return Promise.map(records, (record:any) => {
          if(new Date().getTime() - new Date(record.lastTested).getTime() > 86400000) {
            record['status'] = 'red';
            return api.update(record).then(() => {
              return record;
            });
          }
          return record;
        })
      }
    }).then((records) => {
      accounts = records;
      let selectedAcct = accounts.findIndex(acct => acct.selected),
        account = accounts[selectedAcct];
      this.setState({ api, accounts, selectedAcct, account });
    });
  }

  emitAccountName = (name) => this.props.accountName(name);

  handleAccountsToggle = () => {
    this.setState({ openAccounts: !this.state.openAccounts });
  }
  changeAcctValues = (e, val) => {
    let { name } = e.target,
        accounts = this.state.accounts,
        selectedAcct = this.state.selectedAcct;
    accounts[selectedAcct][name] = val;
    this.setState({ accounts });
  }
  setAccounts() {
    return [{
      name: 'New',
      host: '',
      version: '8.5',
      username: '',
      password: ''
    }];
  }
  save = () => {
    let accounts = this.state.accounts,
        account = this.state.accounts[this.state.selectedAcct],
        acctMsg:string;
    if(account._id) {
      // Update
      this.state.api.update(account).then(() => {
        acctMsg = `${account.name} updated successfully`;
        this.setState({ accounts, openSnack: true, acctMsg });
      });
    } else {
      account['status'] = 'red';
      account['lastTested'] = null;
      this.state.api.add(account).then((doc) => {
        account._id = doc._id;
        acctMsg = `${account.name} added successfully`;
        this.setState({ accounts, openSnack: true, acctMsg });
      });
    }
  }
  testAccount = () => {
    let { accounts, selectedAcct } = this.state,
      account = accounts[selectedAcct],
      { host, version, username, password } = account;
    let cucm = new CucmSql({ host, version, username, password }),
      statement = cucm.testAxlQuery;
    cucm.query(statement, true).then((resp) => {
      console.log(resp);
      account['lastTested'] = moment().toDate();
      if(resp && resp instanceof Array) {
        account['status'] = 'green';
        return this.state.api.update(account);
      } else if(resp.error) {
        account['status'] = 'red';
        return this.state.api.update(account);
      }
    }, (err) => {
      alert('Test Failed');
      account['status'] = 'red';
      return this.state.api.update(account);
    }).then(() => {
      this.state.api.get({ _id: account._id }).then((record) => {
        account = record[0];
        this.setState({ account });
      });
    })
  }
  render() {
    let testColor:string;
    if(this.state.account && this.state.account.status) {
      testColor = this.state.account.status;
    } else {
      testColor = 'red';
    }
    const style = { marginLeft: 20 };
    const actions = [
      <FlatButton
        label='Save'
        icon={<FontIcon className='fa fa-hdd-o' />}
        primary={true}
        keyboardFocused={true}
        onClick={this.save}
      />,
      <FlatButton
        label='Test'
        icon={<FontIcon color={testColor} className='fa fa-plug' />}
        primary={true}
        onClick={this.testAccount}
      />,
      <FlatButton
        label='Close'
        icon={<FontIcon className='fa fa-window-close-o'/>}
        primary={true}
        onClick={() => {
          this.props.acctClose();
        }}
      />
    ];
    let accounts = this.state.accounts;
    if(!accounts || accounts.length===0) {
      accounts = this.setAccounts();
    }
    return (
      <div>
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
                      prevSelected =
                        JSON.parse(JSON.stringify(this.state.selectedAcct)),
                      acctName = $(e.target).text();
                  let selectedAcct = accounts.findIndex(acct=>acct.name===acctName);
                  if(selectedAcct === -1) selectedAcct = 0;
                  let account = accounts[selectedAcct],
                      prevAcct = accounts[prevSelected];
                  account.selected = true;
                  prevAcct.selected = false;
                  this.setState({ selectedAcct });
                  let { api } = this.state;
                  Promise.all([
                    api.update(account), api.update(prevAcct)
                  ]).then(() => {
                    this.emitAccountName(account.name);
                    this.setState({ selectedAcct });
                  })
                }} >
                <Subheader>Account List</Subheader>
                {
                  accounts ? accounts.map((acct, i) => {
                    return (
                      <ListItem
                        key={`acct_${i}`}
                        value={i}
                        primaryText={acct.name}
                        rightIcon={<FontIcon color={acct.status} className='fa fa-dot-circle-o' />}/>
                    );
                  }) : null
                }
              </SelectableList>
              <div>
                <Paper zDepth={1}>
                  <BottomNavigation
                    style={{ position:'fixed', bottom: 0 }}>
                    <BottomNavigationItem
                      label="Account"
                      icon={<FontIcon className='fa fa-user-plus'/>}
                      onClick={()=>{
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
                      onClick={()=>{
                        console.log('remove touched');
                        let accounts = this.state.accounts,
                            acctIdx = this.state.selectedAcct,
                            { _id, name } = accounts[acctIdx];
                        this.state.api.remove(_id).then(() => {
                          accounts.splice(acctIdx, 1);
                          if(accounts.length === 0) {
                            accounts.push({
                              name:'New Account',host:'',version:'8.0',
                              username:'',password:''
                            })
                          }
                          this.setState({
                            selectedAcct: 0,
                            accounts,
                            acctMsg: `${name} removed successfully`,
                            openSnack: true
                          });
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
                value={accounts[this.state.selectedAcct].name}
                onChange={this.changeAcctValues}
                errorText='' />
              <TextField
                hintText="Hostname/IP Address"
                style={style}
                name='host'
                underlineShow={true}
                floatingLabelFixed={true}
                floatingLabelText='CUCM Server'
                value={accounts[this.state.selectedAcct].host}
                onChange={this.changeAcctValues} />
              <Divider />
              <SelectField floatingLabelText='UCM Version'
                style={style}
                value={accounts[this.state.selectedAcct].version}
                onChange={(e,i,val) => {
                  let accounts = this.state.accounts,
                      account = this.state.accounts[this.state.selectedAcct];
                  account.version = val
                  this.setState({ accounts });
                }} >
                {['8.0','8.5','9.0','9.1','10.0','10.5','11.0','11.5'].map((ver,i) => {
                  return <MenuItem value={ver} key={`version_${i}`} primaryText={ver} />
                })}
              </SelectField>
              <TextField
                hintText="user_name"
                style={style}
                name='username'
                underlineShow={true}
                floatingLabelFixed={true}
                floatingLabelText='UserName'
                value={accounts[this.state.selectedAcct].username}
                onChange={this.changeAcctValues} />
              <TextField
                type='password'
                hintText="password"
                name='password'
                style={style}
                underlineShow={true}
                floatingLabelFixed={true}
                floatingLabelText='Password'
                value={accounts[this.state.selectedAcct].password}
                onChange={this.changeAcctValues} />
              <Divider />
            </Paper>
          </div>
        </Dialog>
        <Snackbar
          open={this.state.openSnack}
          message={this.state.acctMsg}
          autoHideDuration={2500}
          onRequestClose={() => {
            this.setState({ openSnack: false, acctMsg: '' });
          }} />
      </div>
    );
  }
}