import './vendor';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import * as $ from 'jquery';
import { App } from './components';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { MuiThemeProvider } from "material-ui/styles";
import { darkBlack, fullWhite } from 'material-ui/styles/colors';

const lightMuiTheme = getMuiTheme({
  tabs: {
    selectedTextColor: darkBlack,
    textColor: darkBlack,
    backgroundColor: '#d7dddd',
  },
  textField: {
    floatingLabelColor: darkBlack,
    focusColor: 'rgb(120,20,17)'
  },
  flatButton: {
    primaryTextColor: darkBlack
  },
  snackbar: {
    textColor: fullWhite
  }
});

const Root = (
  <MuiThemeProvider muiTheme={lightMuiTheme}>
    <App />
  </MuiThemeProvider>
);

ReactDom.render(Root, $('#app')[0]);
