import * as React from 'react';
import {
  Dialog, RaisedButton, MenuItem
} from 'material-ui';

export class Accounts extends React.Component<any,any> {
  constructor() {
    super();
    this.state = { openAccounts: false };
    this.handleAccountsToggle = this.handleAccountsToggle.bind(this);
  }
  handleAccountsToggle() {
    this.setState({ openAccounts: !this.state.openAccounts });
  }
  render() {
    return (
      <div style={{marginTop:'10px'}}>
        <RaisedButton
          label='Add Account'
          onTouchTap={this.handleAccountsToggle}/>
        <MenuItem> Account 1 </MenuItem>
      </div>
    );
  }
}