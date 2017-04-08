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
		this.state = { open: false };
		this.handleClose = this.handleClose.bind(this);
	}
	handleClose() {
		this.setState({ open: false });
	}
	render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleClose}
      />,
      <FlatButton
        label="Submit"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.handleClose}
      />,
    ];
		return (
			<div>
				<Tabs className='tabs-container'
					inkBarStyle={{background:'blue'}}
					tabItemContainerStyle={{width:'400px'}}>
					<Tab icon={
						<FontIcon className='fa fa-database'/>
					}
						label='Accounts'
						value='profs'
						onActive={() => {
							this.setState({ open: true });
						}}>
						<Dialog
							title="Dialog With Actions"
							actions={actions}
							modal={false}
							open={this.state.open}
							onRequestClose={this.handleClose}>
							The actions in this window were passed in as an array of React objects.
						</Dialog>
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
