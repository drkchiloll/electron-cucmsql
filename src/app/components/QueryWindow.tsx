import * as React from 'react';
import * as brace from 'brace';
import AceEditor from 'react-ace';
 
import 'brace/mode/mysql';
import 'brace/theme/monokai';
import 'brace/keybinding/vim';

import {
  Paper, TextField, Divider, Drawer
} from 'material-ui';

export class QueryWindow extends React.Component<any,any> {
  constructor() {
    super();
    this.state = {
      selectedStatement: '',
      drawerWidth: 324,
      editorWidth: 700
    };
  }
  componentDidMount() {
    window.onresize = () => {
      let { innerWidth } = window,
          editorWidth = innerWidth - this.state.drawerWidth;
      this.setState({ editorWidth });
    };
  }
  render() {
    let aceFocus = this.props.view==='mainView' ? true : false;
    return (
      <div>
        <Drawer open={true} width={this.state.drawerWidth}
          containerStyle={{
            marginTop:80, backgroundColor: 'rgb(234,237,237)'
          }}>
          <div style={{marginLeft:20}}>
            <TextField hintText='Search' fullWidth={true} />
          </div>
        </Drawer>
        <div style={{marginLeft:310}}>
          <AceEditor
            mode='mysql'
            theme='monokai'
            onChange={(sql) => {
              this.setState({ selectedStatement: sql });
            }}
            name='editor'
            height='200px'
            width={this.state.editorWidth+'px'}
            tabSize={2}
            focus={aceFocus}
            value={this.state.selectedStatement}
            enableBasicAutocompletion={true}
            enableLiveAutocompletion={true}
            keyboardHandler='vim'/>
        </div>
      </div>
    );
  }
}