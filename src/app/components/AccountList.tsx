import * as React from 'react';
import {
  SelectableList,
  Subheader,
  ListItem,
  FontIcon
} from './index';

export const AccountList = props => {
  return (
    <SelectableList
      value={props.selectedAcct}
      onChange={props.selectAccount}
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