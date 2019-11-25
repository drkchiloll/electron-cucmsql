import * as React from 'react';
import {
  SelectableList,
  Subheader,
  ListItem,
  FontIcon,
  Paper
} from './index';

export const AccountList = props => {
  return (
    <SelectableList
      value={props.selectedAcct}
      onChange={props.selectAccount}
      style={{ overflow: 'auto', maxHeight: 400 }}
    >
      <Subheader>Account List</Subheader>
      {
        props.accounts ? props.accounts.map((acct, i) => {
          return (
            <ListItem
              key={`acct_${i}`}
              value={i}
              primaryText={acct.name}
              rightIcon={
                <FontIcon
                  color={acct.status}
                  className='fa fa-dot-circle-o'
                />
              }/>
          );
        }) : null
      }
    </SelectableList>
  )
}