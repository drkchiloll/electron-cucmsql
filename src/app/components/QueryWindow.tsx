import {
  React, ReactDOM, brace,
  Promise, AceEditor, Api, CucmSql,
  editorConfig, $, Table, Column, Cell,
  Paper, TextField, Divider, Drawer,
  Subheader, List, ListItem, makeSelectable,
  BottomNavigation, BottomNavigationItem,
  Toggle, Dialog, FlatButton, Chip, Avatar,
  indigo900, blue300, red300, SvgIconErrorOutline
} from './index';

let SelectableList = makeSelectable(List);

export class QueryWindow extends React.Component<any,any> {
  constructor(props) {
    super(props);
    this.state = {
      aceFocus: false,
      saveDialog: false,
      vimMode: false,
      editor: null,
      selectedStatement: '',
      queryName: '',
      drawerWidth: 310,
      editorWidth: window.innerWidth - 310,
      selectedQuery: 0,
      queryApi: null,
      fontSize: 14,
      editorSettingsApi: null,
      queries: [],
      queryResults: [],
      openTable: false,
      columns: [],
      rows: [[';D)']],
      rowHeight: 50,
      columnWidths: null,
      hrTop: 275,
      editorHeight: 200
    };
    this._queryChange = this._queryChange.bind(this);
    this._newQuery = this._newQuery.bind(this);
    this._execQuery = this._execQuery.bind(this);
    this._saveQuery = this._saveQuery.bind(this);
    this._setEditorMode = this._setEditorMode.bind(this);
    this._rowDblClick = this._rowDblClick.bind(this);
  }
  componentWillMount() {
    setTimeout(() => {
      let { vimMode, fontSize, recordId } = editorConfig;
      this._setEditorMode(null, vimMode);
      this.setState({ fontSize });
    }, 800)
    let queryApi = new Api({ db: 'queryDb', dbName: 'cucm-query' }),
        selectedQuery = this.state.selectedQuery,
        selectedStatement, aceFocus;
    Promise.all([
      queryApi.get()
    ]).then((results:any) => {
      let queries, editorSettings;
      if(results[0].length===0) queries = queryApi.defaultQuery();
      else queries = results[0];
      if(!selectedStatement) selectedStatement = queries[selectedQuery].query;
      if(this.props.view==='mainView') aceFocus = true;
      else aceFocus = false;
      this.setState({ aceFocus, queries, selectedStatement, queryApi });
      this._setEditorLine(this.state.editor);
    });
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
  _setEditorLine(editor) {
    setTimeout(() => {
      let row = editor.session.getLength() - 1,
          column = editor.session.getLine(row).length;
      editor.focus();
      editor.gotoLine(row + 1, column);
    },0);
  }
  _queryChange(e, value) {
    let selectedStatement = this.state.queries[value].query;
    this.setState({
      selectedQuery: value,
      selectedStatement
    });
    this._setEditorLine(this.state.editor);
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
  _execQuery() {
    let dbApi = new Api({ db: 'acctDb', dbName: 'accounts' });
    dbApi.get({ selected: true}).then((record) => {
      let account = record[0];
      delete account._id;
      delete account.name;
      delete account.selected;
      let cucmHandler = new CucmSql(account);
      let sqlStatement = JSON.parse(
        JSON.stringify(this.state.selectedStatement)
      );
      /*
      let registered = false;
      if(!registered) {
        let insertIndex = sqlStatement.indexOf(' ');
        sqlStatement =
          sqlStatement.replace(' ', ' skip 0 first 5');
      }
      */
      cucmHandler.query(sqlStatement).then((resp:any) => {
        let { columns, rows, errCode, errMessage } = resp;
        if(errCode) {
          return this.setState({ sqlError: true, errMessage });
        }
        let columnWidths = columns.reduce((o, col) => {
          o[col] = 200;
          return o;
        },{});
        let rowHeight = 50;
        if(rows[0].length === 1 && columns[0] === 'Error' ) rowHeight = 95;
        this.setState({
          columns, rows, columnWidths, openTable: true, rowHeight
        });
      });
    });
  }
  _saveQuery() {
    let { selectedStatement, selectedQuery, queries, queryApi } = this.state,
        current = selectedStatement,
        old = queries[selectedQuery],
        oldQuery;
    if(!old) {
      return this.setState({ saveDialog: true });
    } else {
      oldQuery = old.query;
      if(current !== oldQuery) {
        queries[selectedQuery].query = current;
        console.log('statement changed');
        this.setState({ queries })
        queryApi.update(queries[selectedQuery]);
      }
    }
  }
  _setEditorMode(e, checked) {
    let _id = editorConfig.recordId,
        fontSize = this.state.fontSize;
    const ace = require('brace');
    if(checked) this.state.editor.setKeyboardHandler('ace/keyboard/vim');
    else this.state.editor.setKeyboardHandler('');
    editorConfig.update({ _id, vimMode: checked, fontSize }).then((num) => {
      this.setState({ vimMode: checked });
      this.state.editor.focus();
    });
  }
  _rowDblClick(evt, rowIndex) {
    let { id } = evt.target,
        divId = $(`#${evt.target.id}`),
        txtClass = $(`.${evt.target.id}`)[0];
    $(divId).toggle();
    $(txtClass).toggle()
    setTimeout(() => $(`input[name="${id}"`).focus(), 0);
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
            }]}
            name='editor'
            height={`${this.state.editorHeight}px`}
            width={`${this.state.editorWidth}px`}
            tabSize={2}
            fontSize={this.state.fontSize}
            highlightActiveLine={false}
            value={this.state.selectedStatement}
            enableBasicAutocompletion={true}
            enableLiveAutocompletion={true}
            editorProps={{$blockScrolling: Infinity}}/>
          <hr id='editorDivider'
            style={{margin: 0, border: '2px solid #ffcccc'}}
            draggable={true}
            onMouseOver={() => $('#editorDivider').css('cursor','row-resize')}
            onMouseOut={()=>$('#editorDivider').css('cursor','row-resize')}
            onDragEnd={(e) => {
              if(e.pageY == 0) return;
              let editorHeight = 200 + e.pageY - 285 + 1;
              this.setState({ editorHeight });
              $('#editorDivider').css('cursor','pointer');
            }} />
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
          <div style={{ display: this.state.openTable ? 'block': 'none' }}>
            <Table
              rowsCount={this.state.rows[0].length}
              rowHeight={this.state.rowHeight}
              headerHeight={50}
              width={this.state.editorWidth}
              height={500}
              onColumnResizeEndCallback={(newWidth, columnKey) => {
                let columnWidths = this.state.columnWidths;
                columnWidths[columnKey] = newWidth;
                this.setState({ columnWidths });
              }}
              isColumnResizing={false}
              onRowDoubleClick={this._rowDblClick} >
              {
                this.state.columns.map((col, i) => {
                  return (
                    <Column key={`${col}_${i}`} columnKey={col}
                      header={col}
                      isResizable={true}
                      width={this.state.columnWidths[col]}
                      cell={({ rowIndex, width, height }) =>{
                        return (
                          <Cell
                            columnKey={col}
                            height={height}
                            width={width}
                            rowIndex={rowIndex}>
                            <div id={`col_${i}_row_${rowIndex}`}>
                              {this.state.rows[i][rowIndex][col]}
                            </div>
                            <TextField
                              name={`col_${i}_row_${rowIndex}`}
                              style={{display:'none'}}
                              value={this.state.rows[i][rowIndex][col]}
                              underlineShow={false}
                              className={`col_${i}_row_${rowIndex}`}
                              onChange={(e, newValue) => {
                                let rows = this.state.rows;
                                rows[i][rowIndex][col] = newValue;
                                this.setState({ rows });
                              }}
                              onBlur={() => {
                                $(`.col_${i}_row_${rowIndex}`).toggle();
                                $(`#col_${i}_row_${rowIndex}`).toggle();
                              }} />
                          </Cell>
                        )
                      }}/>
                  );
                })
              }
            </Table>
          </div>
          <div style={{ display: this.state.sqlError ? 'block': 'none'}}>
            <Chip
              backgroundColor={blue300}
              onTouchTap={()=>{}}
              style={{ margin: 20 }}
              labelStyle={{fontSize:'16px'}}>
              <Avatar size={32} color={red300} backgroundColor={indigo900} icon={<SvgIconErrorOutline />} />
              {this.state.errMessage}
            </Chip>
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
              onTouchTap={()=>{
                let { queries, queryApi, selectedStatement, queryName } = this.state;
                let record = {
                  name: queryName,
                  query: selectedStatement
                }
                queryApi.add(record).then((doc) => {
                  queries.push(doc);
                  this.setState({ queries, saveDialog: false });
                });
              }} />
          ]} >
          <TextField hintText='Unique Name for Query'
            name='query-name'
            underlineShow={true}
            floatingLabelFixed={true}
            value={this.state.queryName}
            onChange={(e, value)=> this.setState({ queryName: value })}
            errorText='' />
        </Dialog>
      </div>
    );
  }
}