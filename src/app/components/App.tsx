import * as React from 'react'
import * as $ from 'jquery';
import { 
	Tabs, Tab, FontIcon, Dialog,
	FlatButton
} from 'material-ui';

// Import Components
import {
	Accounts, StateLess
} from './index';

export class App extends React.Component<any, any> {
	constructor() {
		super();
		this.state = {
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
			tabValue: 'comp'
		});
	}
	_tabSelect(e:any) {
		this.setState({
			openAcct: true,
			tabValue: 'profs'
		});
	}
	render() {
		return (
			<div>
				<Tabs className='tabs-container'
					inkBarStyle={{background:'blue'}}
					tabItemContainerStyle={{width:'400px'}}
					initialSelectedIndex={this.state.tabIndx}
					value={this.state.tabValue}>
					<Tab icon={
						<FontIcon className='fa fa-database'/>
					}
						label='Accounts'
						value='profs'
						onActive={this._tabSelect}>
						<Accounts
							openDia={this.state.openAcct}
							acctClose={this.handleClose} />
					</Tab>
					<Tab label='Component'
						value='comp'>
					</Tab>
				</Tabs>
				<StateLess />
			</div>
		);
	}
}
