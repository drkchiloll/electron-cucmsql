import * as React from 'react'
import * as $ from 'jquery';
import { 
	Tabs, Tab, FontIcon, Dialog,
	FlatButton
} from 'material-ui';

// Import Components
import {
	Accounts, QueryWindow
} from './index';

export class App extends React.Component<any, any> {
	constructor() {
		super();
		this.state = {
			tabValue: 'mainView',
			openAcct: false,
			tabIndx: 1
		};
		this.handleClose = this.handleClose.bind(this);
		this._tabSelect = this._tabSelect.bind(this);
	}
	handleClose() {
		this.setState({
			openAcct: false,
			tabIdx: 1,
			tabValue: 'mainView'
		});
	}
	_tabSelect(tabValue:string) {
		this.setState({
			openAcct: tabValue==='accts' ? true : false,
			tabValue
		});
	}
	render() {
		return (
			<div>
				<Tabs className='tabs-container'
					inkBarStyle={{background:'rgb(140,20,17)'}}
					tabItemContainerStyle={{width:'400px'}}
					initialSelectedIndex={this.state.tabIndx}
					value={this.state.tabValue}
					onChange={this._tabSelect}>
					<Tab
						icon={<FontIcon className='fa fa-users'/>}
						label='Accounts'
						value='accts'>
						<Accounts
							openDia={this.state.openAcct}
							acctClose={this.handleClose} />
					</Tab>
					<Tab
						icon={<FontIcon className='fa fa-database fa-2x' />}
						label='SQL'
						value='mainView'>
					</Tab>
				</Tabs>
				<QueryWindow view={this.state.tabValue} />
			</div>
		);
	}
}
