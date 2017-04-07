import './vendor';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import * as $ from 'jquery';
import { App } from './components';

// MATERIAL-UI DEPENDENCIES
import * as injectTapEventPlugin from 'react-tap-event-plugin';
// Needed for onTouchTap
// Check this repo:
// https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {
  MuiThemeProvider
} from "material-ui/styles";
import { darkBlack, fullWhite } from 'material-ui/styles/colors';

const lightMuiTheme = getMuiTheme({
  tabs: {
    selectedTextColor: darkBlack,
    textColor: darkBlack,
    backgroundColor: 'rgb(234,237,237)'
  }
});

const Root = (
  <MuiThemeProvider muiTheme={lightMuiTheme}>
    <App />
  </MuiThemeProvider>
);

ReactDom.render(Root, $('#app')[0]);
