import {
  React, ReactDOM, brace,
  Promise, AceEditor, Api, CucmSql,
  editorConfig, $, Table, Column, Cell,
  Paper, TextField, Divider, Drawer,
  Subheader, List, ListItem, makeSelectable,
  BottomNavigation, BottomNavigationItem,
  Toggle, Dialog, FlatButton, Chip, Avatar,
  indigo900, blue300, red300, SvgIconErrorOutline,
  IconButton, FontIcon, Snackbar, LinearProgress,
  SelectableList, CsvCreator, fs, QueryActions,
  CsvUploadPopup, SaveQueryPopup, EditorResizer,
  Editor, Queries, VimToggle, ExportCsvButton,
  QueryResultTable, QuerySidePanel, Utils
} from './index';

export class QueryWindow extends React.Component<any,any> {
  constructor(props) {
    super(props);
    this.state = {
      accountName: 'Account Pending',
      aceFocus: false,
      saveDialog: false,
      fileDialog: false,
      vimMode: false,
      editor: null,
      selectedStatement: '',
      updateStatements: null,
      queryStatements: null,
      queryName: '',
      drawerWidth: 310,
      editorWidth: window.innerWidth - 310,
      selectedQuery: 0,
      queryApi: null,
      fontSize: 14,
      queries: [],
      openTable: false,
      columns: [],
      rows: [[';D)']],
      rowHeight: 50,
      columnWidths: null,
      hrTop: 275,
      editorHeight: 375,
      headers: [{id:'first',display: 'Generic'}],
      rowData: [{first:'generic'}],
      openSnack: false,
      completed: 10,
      showProgress: false,
      progressBar: 'indeterminate',
      progressColor: 'green',
      queryHeight: window.innerHeight - 90
    };
  }
  componentWillMount() {
    window.onresize = () => {
      let { drawerWidth, queryHeight } = this.state;
      let { innerWidth, innerHeight } = window,
        editorWidth = innerWidth - drawerWidth;
      this.setState({ editorWidth });
    };
    setTimeout(() => {
      let { vimMode, fontSize } = editorConfig;
      Utils.setEditorMode({
        fontSize, vimMode, editor: this.state.editor
      }).then((results) => {
        this.setState({ fontSize, vimMode });
        this.state.editor.focus();
      })
    }, 800);
    
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
      let queryName = queries[selectedQuery].name;
      console.log(queryName);
      this.setState({ aceFocus, queries, selectedStatement, queryApi, queryName });
      this._setEditorLine(this.state.editor);
    });
  }


  componentWillReceiveProps(nextProps) {
    if(nextProps && nextProps.accountName) {
      this.setState({ accountName: nextProps.accountName })
    }
    let aceFocus = nextProps.view==='mainView' ? true: false;
    this.setState({ aceFocus });
  }
  _setEditorLine(editor) {
    setTimeout(() => {
      let row = editor.session.getLength() - 1,
          column = editor.session.getLine(row).length;
      editor.focus();
      editor.gotoLine(row + 1, column);
      // editor.setOptions({ maxLines: 25 });
    },0);
  }
  _queryChange = (e, value) => {
    let selectedStatement = this.state.queries[value].query,
        queryName = this.state.queries[value].name;
    this.setState({
      selectedQuery: value,
      selectedStatement,
      queryName
    });
    this._setEditorLine(this.state.editor);
  }
  _newQuery = () => {
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
  _getAccount() {
    return Utils.getAccount();
  }
  _handler = ({ handle, statement, action }) => {
    return handle[action](statement)
      .catch(err => {
        // console.log(err);
        this.setState({
          progressBar: 'determinate',
          progressColor: 'red'
        });
        return {
          columns: ['RESULT'],
          rows: [[{RESULT: 'Query Timeout Probably from Network Error'}]],
          csvRows: [{ RESULT: 'Query Timeout' }]
        };
      });
  }
  _execQuery = () => {
    this.setState({ showProgress: true });
    // console.log(this.state.queryName);
    const account = this._getAccount();
    let cucmHandler = new CucmSql(account);
    let sqlStatement = JSON.parse(
      JSON.stringify(this.state.selectedStatement)
    );
    if(this.state.updateStatements) {
      let {
        columns, rows, rowData, headers, updateStatements, queryStatements
      } = Utils.cleanState(this.state);
      return Promise.each(updateStatements, (statement:string, i) => {
        return this._handler({
          handle: cucmHandler,
          statement,
          action: 'update'
        })
        .then((res:any) =>
          this._handler({
            handle: cucmHandler,
            statement: queryStatements[i],
            action: 'query'
          }))
        .then((resp:any) => {
          if(i === 0) {
            columns.push('New VM Profile');
            headers.push({ id: 'New VM Profile' });
            rows[4] = [];
          }
          if(!rows[4]) rows[4] = [];
          rows[4].push({ 'New VM Profile': resp.rows[2][0].vmprofile });
          if(rowData && rowData[i]) rowData[i]['New VM Profile'] = resp.rows[2][0].vmprofile;
        });
      }).then(() => {
        let columnWidths = Utils.colWidth(columns);
        this.setState({ columns, rowData, rows, headers, columnWidths, showProgress: false });
      })
    } else if(this.state.selectedStatement) {
      this._handler({
        handle: cucmHandler,
        statement: sqlStatement,
        action: 'query'
      }).then((resp) => this.setState({ ...Utils.handleCucmResp(resp) }))
    }
  }
  _saveQuery = () => {
    let { selectedStatement, selectedQuery, queries, queryApi } = this.state,
        current = selectedStatement,
        old = queries[selectedQuery],
        oldQuery;
    if(!old) {
      return this.setState({ saveDialog: true, queryName: '' });
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
  _saveNewQuery = () => {
    let {
      queries, queryApi, selectedStatement, queryName
    } = this.state;
    let record = {
      name: queryName, query: selectedStatement
    };
    queryApi.add(record).then(doc => {
      queries.push(doc);
      this.setState({
        queries,
        saveDialog: false,
        selectedQuery: queries.length - 1
      });
    });
  }
  _upload = () => {
    let file = $('#csv-upload').prop('files')[0],
      csv = fs.readFileSync(file.path).toString().split('\n'),
      data = csv.shift(),
      sqlStatement = this.state.selectedStatement,
      queryName = this.state.queryName,
      selectedStatement = '',
      queryStatements = [];
    this.setState({ showProgress: true });
    // value 1: dn, value 2: partition, value 3: new VM Profile
    switch(queryName) {
      case queryName.includes('VMProfile'):
        return this._updateVmp({
          csv, sqlStatement, queryName
        });
      case queryName.includes('Translation Pattern'):
        break;
    }
  }
  _updateVmp = ({ csv, sqlStatement, queryName }) => {
    Utils.statements({
      csv, statement: sqlStatement
    }).then(({queryStatements, selectedStatement }) => {
      this.setState({
        selectedStatement,
        updateStatements: selectedStatement.split('\r\r'),
        queryStatements,
        fileDialog: false
      });
      this._setEditorLine(this.state.editor);
      this._execUpdateQuery(queryStatements);
    });
  }
  _clear = () => {
    let {
      selectedQuery, rows, rowData, columns, columnWidths, updateStatements
    } = this.state;
    let selectedStatement;
    let queryApi = new Api({ db: 'queryDb', dbName: 'cucm-query' });
    queryApi.get().then((results:any) => {
      selectedStatement = results[selectedQuery].query;
      this.setState({
        selectedStatement, rows: [[';D)']], rowData: [{ first: 'generic' }],
        columns: [], columnWidths: null,
        openTable: false, updateStatements: null,
        progressBar: 'indeterminate', progressColor: 'green'
      });
    });
  }
  _execUpdateQuery = (statements) => {
    // console.log(statements);
    let columns, rows, csvRows, columnWidths, rowHeight, HEADERS;
    const account = this._getAccount();
    let cucmHandler = new CucmSql(account);
    Promise.each(statements, (statement: any, i: number) => {
      return cucmHandler.query(statement).then((resp: any) => {
        if(i === 0) {
          columns = resp.columns;
          HEADERS = columns.map((col: any, i) => ({ id: col }));
          columnWidths = columns.reduce((o, col) => {
            o[col] = 200;
            return o;
          }, {});
          rowHeight = 50;
          rows = resp.rows;
          csvRows = resp.csvRows;
        } else {
          if(resp.rows) {
            resp.rows.forEach((rs, i) => {
              rows[i].push(rs[0]);
            });
            if(csvRows) csvRows = csvRows.concat(resp.csvRows);
          }
        }
      })
    }).then(() => {
      this.setState({
        columns, rows, columnWidths, openTable: true,
        rowHeight, headers: HEADERS, rowData: csvRows,
        showProgress: false
      });
    })
  }
  render() {
    let {
      queryName, fileDialog, saveDialog,
      aceFocus, queries, selectedQuery, openTable,
      fontSize, editor, drawerWidth
    } = this.state;
    return (
      <div>
        <QuerySidePanel 
          drawerWidth={drawerWidth}
          queries={queries}
          change={this._queryChange}
          selectedQuery={selectedQuery} />
        <div style={{position:'fixed', left: 310}}>
          <QueryActions
            save={this._saveQuery}
            newQuery={this._newQuery}
            showFile={() => this.setState({ fileDialog: true})}
            exec={this._execQuery}
            clear={this._clear}
            accountName={this.state.accountName} />
          {
            queryName ?
              <div>
                <hr style={{margin:0, padding:0}}/>
                <TextField
                  id='qname'
                  underlineShow={false}
                  style={{ marginLeft: 10, width: 350 }}
                  value={queryName}
                  onChange={(e, val) => {
                    this.setState({ queryName: val });
                  }} />
                <IconButton tooltip={'Delete Query'} iconClassName='fa fa-ban fa-lg'
                  tooltipPosition='top-center' />
                <IconButton tooltip={'Modify Query Name'} iconClassName='fa fa-floppy-o fa-lg'
                  tooltipPosition='top-center'
                  onClick={() => {
                    const query = queries[selectedQuery];
                    queries[selectedQuery].name = queryName;
                    this.state.queryApi.update(query).then(() =>
                      this.setState({ queries }));
                  }} />
              </div> :
              null
          }
          <Editor 
            init={(editor) => this.setState({ editor })}
            change={(selectedStatement) =>
              this.setState({ selectedStatement })}
            { ...this.state } />
          <EditorResizer changeHeight={
            editorHeight => this.setState({ editorHeight })
          } />
          <LinearProgress mode={this.state.progressBar}
            color={this.state.progressColor} value={100}
            style={{ height: 12, display: this.state.showProgress ? 'block': 'none' }} />
          <VimToggle
            vimMode={this.state.vimMode}
            set={(e, checked) => {
              Utils.setEditorMode({
                fontSize, editor, vimMode: checked
              }).then(() => {
                this.setState({ vimMode: checked });
                editor.focus();
              });
            }} />
          {
            openTable ?
              <div>
                <ExportCsvButton
                  headers={this.state.headers}
                  rows={this.state.rowData || []} />
                <QueryResultTable
                  {...this.state}
                  rowChange={(rows) => this.setState({ rows })}
                  resizeColumn={columnWidths => this.setState({ columnWidths })} />
              </div> :
              null
          }
        </div>
        {
          fileDialog ?
            <CsvUploadPopup
              close={() => this.setState({ fileDialog: false })}
              upload={this._upload} /> :
          saveDialog ?
            <SaveQueryPopup
              queryName={queryName}
              save={this._saveNewQuery}
              change={(val) => this.setState({ queryName: val })} /> :
            null
        }
      </div>
    );
  }
}