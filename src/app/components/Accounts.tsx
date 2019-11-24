import {
  React, $, cucmHelper,
  Drawer, MenuItem, Dialog, FlatButton,
  FontIcon, Paper, Divider, TextField,
  Subheader, ListItem, SelectableList,
  Snackbar, SelectField, Utils,
  AccountActionButtons, AccountList
} from './index';

export class Accounts extends React.Component<any,any> {
  constructor(props) {
    super(props);
    const accounts = Utils.getAccounts();
    let selectedAcct = accounts.findIndex(a => a.selected);
    if(selectedAcct === -1) selectedAcct = 0;
    const account = accounts[selectedAcct];
    props.accountName(accounts[selectedAcct].name);
    this.state = {
      api: null,
      accounts,
      openAccounts: false,
      selectedAcct,
      account, 
      openSnack: false,
      acctMsg: ''
    };
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
    let { accounts } = this.state;
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
              onChange={(e,idx,val) => {
                account.version = val
                this.setState({ accounts });
              }} >
                {
                  ['8.0','8.5','9.0','9.1','10.0','10.5','11.0','11.5','12.0']
                    .map((ver,indx) => {
                      return (
                        <MenuItem
                          value={ver}
                          key={`version_${indx}`}
                          primaryText={ver}
                        />
                      );
                    })
                }
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
              if(prop.name === 'password')
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
  }

  selectAccount = e => {
    const { accounts, selectedAcct } = this.state;
    let prevSelected = JSON.parse(JSON.stringify(selectedAcct));
    const accountName = $(e.target).text();
    let newSelectedAccount = accounts.findIndex(a => a.name === accountName);
    if(newSelectedAccount === -1) newSelectedAccount = 0;
    let account = accounts[newSelectedAccount],
      previousAccount = accounts[prevSelected];
    account['selected'] = true;
    previousAccount['selected'] = false;
    this.emitAccountName(account.name);
    Utils.setAccounts(accounts);
    this.setState({
      selectedAcct: newSelectedAccount
    });
  }

  handleAccountAddClick = () => {
    console.log('add account');
    let { accounts } = this.state;
    // Reset Selected Account
    accounts = accounts.map(a => {
      if(a.selected) a.selected = false;
      return a;
    })
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
      account,
      selectedAcct: accounts.length - 1
    });
  }

  deleteAccount = () => {
    console.log('remove touched');
    let { accounts, selectedAcct } = this.state;
    if(accounts.length === 1) {
      return this.setState({
        openSnack: true,
        acctMsg: 'This is the only account..Please edit this account'
      })
    }
    const originalAccountName = JSON.parse(JSON.stringify(accounts))[selectedAcct].name;
    accounts.splice(selectedAcct, 1);
    let accountName: string;
    if(selectedAcct !== 0) {
      accounts[selectedAcct - 1].selected = true;
      accountName = accounts[selectedAcct - 1].name;
    } else {
      accounts[0].selected = true;
      accountName = accounts[0].name;
    }
    this.emitAccountName(accountName);
    Utils.setAccounts(accounts);
    this.setState({
      accounts,
      openSnack: true,
      acctMsg: `${originalAccountName} was removed successfully`,
      selectedAcct: accounts.length - 1
    });
  }

  render() {
    let { accounts, selectedAcct } = this.state;
    return (
      <div>
        <Dialog
          actions={this.flatActions()}
          modal={false}
          open={this.props.openDia}
          onRequestClose={this.props.acctClose}>
          <div>
            <Drawer open={true} width={225}>
              <AccountList
                accounts={accounts}
                selectedAcct={selectedAcct}
                selectAccount={this.selectAccount}
              />
              <AccountActionButtons
                handleAccountAddClick={this.handleAccountAddClick}
                deleteAccount={this.deleteAccount}
              />
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