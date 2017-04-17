import * as React from 'react';
import * as brace from 'brace';
import AceEditor from 'react-ace';
 
import 'brace/mode/mysql';
import 'brace/theme/monokai';
import 'brace/keybinding/vim';

import {
  Paper, TextField, Divider, Drawer,
  Subheader, List, ListItem, makeSelectable,
  BottomNavigation, BottomNavigationItem
} from 'material-ui';

let SelectableList = makeSelectable(List);

export class QueryWindow extends React.Component<any,any> {
  constructor() {
    super();
    this.state = {
      selectedStatement: null,
      drawerWidth: 324,
      editorWidth: 720,
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
  }
  componentWillMount() {
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
  _queryChange(e, value) {
    let selectedStatement = this.state.queries[value].query;
    this.setState({
      selectedQuery: value,
      selectedStatement
    });
  }
  _newQuery() {

  }
  _execQuery() {

  }
  _saveQuery() {

  }
  render() {
    let aceFocus = this.props.view==='mainView' ? true : false;
    if(this.props.save) {
      console.log(this.state.selectedStatement);
    }
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
            highlightActiveLine={false}
            focus={aceFocus}
            value={this.state.selectedStatement}
            enableBasicAutocompletion={true}
            enableLiveAutocompletion={true}
            keyboardHandler='vim'
            editorProps={{$blockScrolling: 1}}/>
          <Paper zDepth={2} >
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
                icon={
                  <span className="fa-stack fa-lg">
                    <i className="fa fa-square fa-stack-2x"></i>
                    <i className="fa fa-terminal fa-stack-1x fa-inverse"></i>
                  </span>
                }
                label='New Query'
                onTouchTap={this._newQuery}/>
              <BottomNavigationItem
                icon={
                  <span className='fa-stack fa-lg'>
                    <i className='fa fa-save fa-stack-2x'/>
                  </span>
                }
                label='Save'
                onTouchTap={this._saveQuery}/>
            </BottomNavigation>
          </Paper>
        </div>
      </div>
    );
  }
}