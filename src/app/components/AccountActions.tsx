import * as React from 'react';
import {
	BottomNavigation,
	BottomNavigationItem,
	FontIcon
} from 'material-ui';

export const AccountActions = (props: any) => (
	<BottomNavigation
		style={{ position:'fixed', bottom: 0 }}
	>
		<BottomNavigationItem
			label="Account"
			icon={<FontIcon className='fa fa-user-plus'/>}
			onClick={props.handleAccountAddClick}
		/>
		<BottomNavigationItem
			label="Remove"
			icon={<FontIcon color='red' className='fa fa-trash'/>}
			onClick={props.deleteAccount}
		/>
	</BottomNavigation>
)
