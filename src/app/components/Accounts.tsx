import {
  React, $, Api, CucmSql, moment, Promise,
  Drawer, MenuItem, Dialog, FlatButton,
  BottomNavigation, BottomNavigationItem,
  FontIcon, Paper, Divider, TextField,
  Subheader, List, ListItem, SelectableList,
  Snackbar, SelectField
} from './index';

import { Utils } from '../lib/utils';

export class Accounts extends React.Component<any,any> {
  constructor() {
    super();
    this.state = {
      api: null,
      accounts: Utils.getAccounts(),
      openAccounts: false,
      selectedAcct: 0,
      account: null,
      openSnack: false,
      acctMsg: ''
    };
  }
  componentWillMount() {
    let accounts = Utils.getAccounts();
    let selectedAcct = accounts.findIndex(acct => acct.selected);
    this.setState({ accounts, selectedAcct, account: accounts[selectedAcct] });
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
    Utils.setAccounts(accounts);
  }

  save = () => {
    const { accounts, selectedAcct } = this.state;
    let account = accounts[selectedAcct],
        acctMsg:string;
    Utils.setAccounts(accounts);
    acctMsg = `${account.name} updated successfully`;
    this.setState({ accounts, openSnack: true, acctMsg });
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
      } else if(resp.error) {
        account['status'] = 'red';
      }
      Utils.setAccounts(accounts);
      this.setState({ account });
    }, (err) => {
      alert('Test Failed');
      account['status'] = 'red';
      Utils.setAccounts(accounts);
      return;
    }).then(() => {
      this.setState({ account });
    });
  }

  render() {
    let { accounts, account, selectedAcct } = this.state;
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
                  this.emitAccountName(account.name);
                  Utils.setAccounts(accounts);
                  this.setState({ selectedAcct });
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
                          this.emitAccountName(accounts[0].name);
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
                value={accounts[selectedAcct].name}
                onChange={this.changeAcctValues}
                errorText='' />
              <TextField
                hintText="Hostname/IP Address"
                style={style}
                name='host'
                underlineShow={true}
                floatingLabelFixed={true}
                floatingLabelText='CUCM Server'
                value={accounts[selectedAcct].host}
                onChange={this.changeAcctValues} />
              <Divider />
              <SelectField floatingLabelText='UCM Version'
                style={style}
                value={accounts[selectedAcct].version}
                onChange={(e,i,val) => {
                  accounts[selectedAcct].version = val
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
                value={accounts[selectedAcct].username}
                onChange={this.changeAcctValues} />
              <TextField
                type='password'
                hintText="password"
                name='password'
                style={style}
                underlineShow={true}
                floatingLabelFixed={true}
                floatingLabelText='Password'
                value={accounts[selectedAcct].password}
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