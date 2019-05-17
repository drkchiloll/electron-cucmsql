import {
  React, $, cucmHelper,
  Drawer, MenuItem, Dialog, FlatButton,
  BottomNavigation, BottomNavigationItem,
  FontIcon, Paper, Divider, TextField,
  Subheader, ListItem, SelectableList,
  Snackbar, SelectField, Utils
} from './index';

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
    if(selectedAcct === -1) selectedAcct = 0;
    this.emitAccountName(accounts[selectedAcct].name);
    this.setState({ accounts, selectedAcct, account: accounts[selectedAcct] });
  }

  emitAccountName = (name: string) => this.props.accountName(name);

  handleAccountsToggle = () => this.setState({
    openAccounts: !this.state.openAccounts
  });

  changeAcctValues = (e: any, val: string) => {
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
    this.emitAccountName(account.name);
    this.setState({ accounts, openSnack: true, acctMsg });
  }

  testAccount = () => {
    let { accounts, selectedAcct } = this.state;
    return cucmHelper.test({
      accounts, selectedAcct
    }).then((account) => {
      Utils.setAccounts(account);
      this.setState({ account });
    })
    //   account = accounts[selectedAcct],
    //   { host, version, username, password } = account;
    // let cucm = new CucmSql({ host, version, username, password }),
    //   statement = cucm.testAxlQuery;
    // cucm.query(statement, true).then((resp) => {
    //   account['lastTested'] = moment().toDate();
    //   if(resp && resp instanceof Array) {
    //     account['status'] = 'green';
    //   } else if(resp.error) {
    //     account['status'] = 'red';
    //   }
    //   Utils.setAccounts(accounts);
    //   this.setState({ account });
    // }, (err) => {
    //   alert(err.error);
    //   account['status'] = 'red';
    //   Utils.setAccounts(accounts);
    //   return;
    // }).then(() => {
    //   this.setState({ account });
    // });
  }

  close = () => {
    let accounts = Utils.getAccounts();
    let selectedAcct = accounts.findIndex(a => a.selected);
    let account = accounts[selectedAcct];
    this.setState({ account, selectedAcct, accounts });
    this.props.acctClose();
  }

  flatActions = () => {
    const labels = ['Save', 'Test', 'Close'];
    return labels.map(label => {
      return (
        <FlatButton
          label={label}
          icon={
            <FontIcon
              className={(() => {
                let prefix = 'fa fa';
                if(label === 'Save')
                  return `${prefix}-hdd-o`;
                else if(label === 'Test')
                  return `${prefix}-plug`;
                else return `${prefix}-window-close-o`;
              })()}
              color={(() => {
                if(label === 'Test') {
                  if(this.state.account && this.state.account.status) {
                    return this.state.account.status
                  } else {
                    return 'red';
                  }
                }
              })()}
            />
          }
          primary={true}
          keyboardFocused={(() => {
            if(label === 'Save') return true;
            return false;
          })()}
          onClick={(() => {
            return label === 'Save' ? this.save :
              label === 'Test' ? this.testAccount :
              this.close
          })()}
        />
      );
    }) 
  }

  accountForm = account => {
    const formProps = [{
      name: 'name',
      text: 'Connection Name',
      label: 'Account Name',
      value: account.name,
    }, {
      name: 'host',
      text: 'Hostname Or IP Address',
      label: 'CUCM Server Address',
      value: account.host
    }, 
    null,
    {
      name: 'username',
      text: 'Username',
      label: 'Username',
      value: account.username
    },{
      name: 'password',
      text: 'password',
      label: 'Password',
      value: account.password
    }, null];
    return formProps.map((prop, i) => {
      if(!prop && (i > 1 && i < 4)) {
        return (
          <div key={i}>
            <Divider />
            <SelectField
              floatingLabelText='UCM Version'
              style={{ marginLeft: 20 }}
              value={account.version}
              onChange={(e,i,val) => {
                account.version = val
                // this.setState({ accounts });
              }} >
                {['8.0','8.5','9.0','9.1','10.0','10.5','11.0','11.5','12.0'].map((ver,i) => {
                  return <MenuItem value={ver} key={`version_${i}`} primaryText={ver} />
                })}
            </SelectField>
          </div>
        )
      } else if(!prop) {
        return <Divider key={i} />
      } else {
        return (
          <TextField
            key={i}
            type={(() => {
              if(account.name === 'password')
                return 'password';
              else return 'text'
            })()}
            hintText={prop.text}
            style={{ marginLeft: 20 }}
            name={prop.name}
            underlineShow={true}
            floatingLabelFixed={true}
            floatingLabelText={prop.label}
            value={prop.value}
            onChange={this.changeAcctValues}
          />
        )
      }
    })
  };

  render() {
    let { accounts, selectedAcct } = this.state;
    const style = { marginLeft: 20 };
    return (
      <div>
        <Dialog
          actions={this.flatActions()}
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
                        accounts = accounts.map(a => {
                          if(a.selected) a.selected = false;
                          return a;
                        });
                        const account: any = {
                          name: 'New Account',
                          host: '',
                          version: '12.0',
                          username: '',
                          password: '',
                          selected: true,
                          status: 'red'
                        };
                        accounts.push(account);
                        this.setState({
                          accounts,
                          selectedAcct: accounts.length - 1,
                          account
                        });
                      }}
                    />
                    <BottomNavigationItem
                      label="Remove"
                      icon={<FontIcon color='red' className='fa fa-trash'/>}
                      onClick={()=>{
                        console.log('remove touched');
                        let accounts = this.state.accounts,
                            acctIdx = this.state.selectedAcct;
                        if(accounts.length === 1) {
                          return this.setState({
                            openSnack: true,
                            acctMsg: `This is the only account setup..Please Edit this Account`
                          });
                        }
                        accounts.splice(acctIdx, 1);
                        let accountName: string;
                        if(acctIdx !== 0) {
                          accounts[acctIdx - 1].selected = true;
                          accountName = accounts[acctIdx-1].name;
                        } else {
                          accounts[0].selected = true;
                          accountName = accounts[0].name;
                        }
                        this.emitAccountName(accountName);
                        Utils.setAccounts(accounts);
                        this.setState({
                          selectedAcct: 0,
                          accounts,
                          acctMsg: `${name} removed successfully`,
                          openSnack: true
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
              { this.accountForm(accounts[selectedAcct]) }
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