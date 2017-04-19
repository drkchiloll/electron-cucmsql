import * as React from 'react';
import * as brace from 'brace';
import AceEditor from 'react-ace';

import * as $ from 'jquery'
 
import 'brace/mode/mysql';
import 'brace/theme/monokai';
import 'brace/keybinding/vim';

import {
  Paper, TextField, Divider, Drawer,
  Subheader, List, ListItem, makeSelectable,
  BottomNavigation, BottomNavigationItem,
  Toggle, Dialog, FlatButton
} from 'material-ui';

let SelectableList = makeSelectable(List);

export class QueryWindow extends React.Component<any,any> {
  constructor() {
    super();
    this.state = {
      aceFocus: false,
      saveDialog: false,
      vimMode: false,
      editor: null,
      selectedStatement: null,
      drawerWidth: 310,
      editorWidth: 700,
      selectedQuery: 0,
      queries: [{
        name: 'q1',
        query: 'select description from device\nwhere device like "SEP%"'
      }, {
        name: 'q2',
        query: 'select dnorpattern from numplan\nwhere dnorpattern="1001"'
      }]
    };
    this._queryChange = this._queryChange.bind(this);
    this._newQuery = this._newQuery.bind(this);
    this._execQuery = this._execQuery.bind(this);
    this._saveQuery = this._saveQuery.bind(this);
    this._setEditorMode = this._setEditorMode.bind(this);
  }
  componentWillMount() {
    if(this.props.view==='mainView') this.setState({ aceFocus: true });
    let { selectedQuery, selectedStatement, queries } = this.state;
    if(!selectedStatement) selectedStatement = queries[selectedQuery].query;
    this.setState({ selectedStatement });
  }
  componentDidMount() {
    window.onresize = () => {
      let { innerWidth } = window,
          editorWidth = innerWidth - this.state.drawerWidth;
      this.setState({ editorWidth });
    };
  }
  componentWillReceiveProps(nextProps) {
    let aceFocus = nextProps.view==='mainView' ? true: false;
    this.setState({ aceFocus });
  }
  _queryChange(e, value) {
    let selectedStatement = this.state.queries[value].query;
    this.setState({
      selectedQuery: value,
      selectedStatement
    });
    setTimeout(() => {
      let editor = this.state.editor,
          row = editor.session.getLength() - 1,
          column = editor.session.getLine(row).length;
      editor.focus();
      editor.gotoLine(row + 1, column);
    },0);
  }
  _newQuery() {
    let { selectedStatement, selectedQuery, queries } = this.state,
        current = selectedStatement,
        old = queries[selectedQuery].query;
    if(current !== old) {
      // We Need to Prompt the User if they Want to Save the Previous
    }
    selectedStatement = '';
    selectedQuery = queries.length + 1;
    this.setState({ selectedStatement, selectedQuery });
    this.state.editor.focus();
  }
  _execQuery() {}

  _saveQuery() {
    console.log('save');
    let { selectedStatement, selectedQuery, queries } = this.state,
        current = selectedStatement,
        old = queries[selectedQuery],
        oldQuery;

    console.log(current);
    console.log(old);
    if(!old) {
      return this.setState({ saveDialog: true });
    } else {
      oldQuery = old.query;
      if(current !== oldQuery) {
        console.log('statement changed');
      }
    }
  }
  _setEditorMode(e, checked) {
    const ace = require('brace');
    if(checked) this.state.editor.setKeyboardHandler('ace/keyboard/vim');
    else this.state.editor.setKeyboardHandler('');
    this.setState({ vimMode: checked });
    this.state.editor.focus();
  }
  render() {
    let aceFocus = this.state.aceFocus;
    return (
      <div>
        <Drawer open={true} width={this.state.drawerWidth}
          containerStyle={{
            marginTop:80, backgroundColor: '#d7dddd'
          }}>
          <div style={{marginLeft:20}}>
            <TextField hintText='Search' fullWidth={true} />
            <SelectableList value={this.state.selectedQuery}
              onChange={this._queryChange} >
              <Subheader>Query List</Subheader>
              {
                this.state.queries.map((q, i) => {
                  return (
                    <ListItem
                      key={`query_${i}`}
                      value={i}
                      primaryText={q.name}/>
                  );
                })
              }
            </SelectableList>
          </div>
        </Drawer>
        <div style={{position:'fixed', left: 310}}>
          <BottomNavigation
            style={{
              backgroundColor: '#d7dddd',
              height: 75
            }}>
            <BottomNavigationItem
              icon={
                <span className="fa-stack fa-lg">
                  <i className="fa fa-database fa-stack-2x fa-inverse"></i>
                  <i className="fa fa-play-circle fa-stack-1x"
                    style={{margin: '10px 0 0 15px'}} />
                </span>
              }
              label='Execute SQL'
              onTouchTap={this._execQuery}/>
            <BottomNavigationItem
              className='new-query'
              icon={
                <span className="fa-stack fa-lg">
                  <i className="fa fa-square fa-stack-2x"></i>
                  <i className="fa fa-terminal fa-stack-1x fa-inverse"></i>
                </span>
              }
              label='New Query'
              onClick={this._newQuery}/>
            <BottomNavigationItem
              className='save-query'
              icon={
                <span className='fa-stack fa-lg'>
                  <i className='fa fa-hdd-o fa-stack-2x'/>
                </span>
              }
              label='Save'
              onClick={this._saveQuery}/>
          </BottomNavigation>
          <AceEditor
            mode='mysql'
            theme='monokai'
            onLoad={(editor) => {
              const ace = require('brace'),
                    Vim = ace.acequire('ace/keyboard/vim').CodeMirror.Vim;
              Vim.defineEx('write', 'w', (cm, input) => {
                this._saveQuery();
              });
              this.setState({ editor });
            }}
            onChange={(sql) => {
              this.setState({ selectedStatement: sql });
            }}
            className='editor'
            focus={aceFocus}
            commands={[{
              name:'save',
              bindKey: {
                win: 'Ctrl-S', mac: 'Command-S'
              },
              exec: function() {
                $('.save-query').get(0).click();
              }
            }, {
              name:'new-query',
              bindKey: { win: 'Ctrl-N', mac: 'Command-N' },
              exec: function() {
                $('.new-query').get(0).click();
              }
            }
            ]}
            name='editor'
            height='200px'
            width={`${this.state.editorWidth}px`}
            tabSize={2}
            highlightActiveLine={false}
            value={this.state.selectedStatement}
            enableBasicAutocompletion={true}
            enableLiveAutocompletion={true}
            editorProps={{$blockScrolling: Infinity}}/>
          <div style={{float:'right'}}>
            <Toggle
              label='Enable VIM Mode'
              toggled={this.state.vimMode}
              trackStyle={{backgroundColor: 'red'}}
              thumbStyle={{backgroundColor:'#ffcccc'}}
              thumbSwitchedStyle={{backgroundColor: '#72d86e'}} //Thumb Checked/On
              trackSwitchedStyle={{backgroundColor: 'green'}} // Track Checked/On
              onToggle={this._setEditorMode} />
          </div>
        </div>
        <Dialog open={this.state.saveDialog}
          title='Save Query'
          modal={true}
          style={{width:600, margin :'25px 0 0 25%', top: -250}}
          actions={[
            <FlatButton label='Cancel'
              primary={true}
              onTouchTap={()=> this.setState({ saveDialog: false })} />,
            <FlatButton label='Save'
              primary={true}
              onTouchTap={()=>{}} />
          ]} >
          <TextField hintText='Unique Name for Query'
            name='query-name'
            underlineShow={true}
            floatingLabelFixed={true}
            value={this.state.queryName}
            onChange={()=>{}}
            errorText='' />
        </Dialog>
      </div>
    );
  }
}