import * as React from 'react';
import {
  Drawer, MenuItem, Dialog, FlatButton,
  BottomNavigation, BottomNavigationItem,
  FontIcon, Paper, Divider, TextField
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
    const style = { marginLeft: 20 };
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.props.acctClose}
      />,
      <FlatButton
        label="Submit"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.props.acctClose}
      />,
    ];
    return (
        <Dialog
          actions={actions}
          modal={false}
          open={this.props.openDia}
          onRequestClose={this.props.acctClose}>
        <div>
          <Drawer open={true} width={225}>
            <MenuItem> Account 1 </MenuItem>
            <div style={{position:'fixed', bottom: 0}}>
              <Paper zDepth={1}>
                <BottomNavigation style={{
                    position:'fixed',
                    bottom: 0
                  }}>
                  <BottomNavigationItem
                    label="Account"
                    icon={<FontIcon className='fa fa-user-plus'/>}
                    onTouchTap={()=>{}}
                  />
                  <BottomNavigationItem
                    label="Remove"
                    icon={<FontIcon color='red' className='fa fa-trash'/>}
                    onTouchTap={()=>{}}
                  />
                </BottomNavigation>
              </Paper>
            </div>
          </Drawer>
        </div>
        <div style={{marginLeft:'235px'}}>
          <Paper zDepth={2}>
            <TextField hintText="Kaiser Cluster 2" style={style} underlineShow={false}
              floatingLabelFixed={true} floatingLabelText='Account Name' />
            <Divider />
            <TextField hintText="Middle name" style={style} underlineShow={false} />
            <Divider />
            <TextField hintText="Last name" style={style} underlineShow={false} />
            <Divider />
            <TextField hintText="Email address" style={style} underlineShow={false} />
            <Divider />
          </Paper>
        </div>
        </Dialog>
    );
  }
}