import * as React from 'react'
import * as $ from 'jquery';
import { Tabs, Tab, FontIcon } from 'material-ui';

// Import Components
import {
	Accounts, StateLess
} from './index';

export class App extends React.Component<any, any> {
	constructor() {
		super();
	}
	render() {
		return (
			<div>
				<Tabs className='tabs-container'
					inkBarStyle={{background:'blue'}}
					tabItemContainerStyle={{width:'400px'}}>
					<Tab icon={
						<FontIcon className='fa fa-database'/>
					}
						label='Accounts'
						value='profs'>
						<Accounts />
					</Tab>
					<Tab label='Component'
						value='comp'>
						<StateLess />
					</Tab>
				</Tabs>
			</div>
		);
	}
}
