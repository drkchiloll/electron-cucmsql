import * as Promise from 'bluebird';
import { editorConfig } from '../vendor';
import * as fs from 'fs';
import * as path from 'path';

export class Utils {

  static csvHeaders(cols) {
    return cols.map((col, i) => ({id: col}));
  }

  static colWidth(cols) {
    return cols.reduce((o: any, col: string) => {
      o[col] = 200;
      return o;
    }, {});
  }

  static statements({ csv, statement }) {
    let selectedStatement = '';
    return Promise.reduce(csv, (a, val:string, i) => {
      let v = val.split(','),
        dn = v[0].replace('\r', ''),
        rp = v[1].replace('\r', ''),
        vmp = v[2].replace('\r', '');
      if(i + 1 === csv.length) {
        selectedStatement += statement
          .replace('%1', vmp).replace('%2', rp).replace('%3', dn) + '\n';
      } else {
        selectedStatement += statement
          .replace('%1', vmp).replace('%2', rp).replace('%3', dn) + '\r\r';
      }
      a.push(this.statement({ dn, partition: rp }));
      return a;
    }, []).then((queryStatements) => ({ queryStatements, selectedStatement }));
  }

  static statement({ dn, partition }) {
    return (
      `SELECT d.name, n.dnorpattern as dn, vmp.name as vmprofile,\n` + 
      `rp.name as partition\nFROM device d\n` +
      `inner join devicenumplanmap dmap ON dmap.fkdevice = d.pkid\n` +
      `inner join numplan n ON dmap.fknumplan = n.pkid\n` +
      `inner join routepartition rp ON n.fkroutepartition = rp.pkid\n` +
      `inner join voicemessagingprofile vmp ON ` + 
      `n.fkvoicemessagingprofile = vmp.pkid\n` +
      `where n.dnorpattern='${dn}' AND rp.name='${partition}'`
    );
  }

  static cleanState(state: any) {
    const columns = JSON.parse(JSON.stringify(state.columns)),
      rows = JSON.parse(JSON.stringify(state.rows)),
      rowData = JSON.parse(JSON.stringify(state.rowData)),
      headers = JSON.parse(JSON.stringify(state.headers)),
      updateStatements = JSON.parse(JSON.stringify(state.updateStatements)),
      queryStatements = JSON.parse(JSON.stringify(state.queryStatements));
    return {columns, rows, rowData, headers, updateStatements, queryStatements};
  } 

  static handleCucmResp(resp: any) {
    const { columns, rows, csvRows, errCode, errMessage, error } = resp;
    if(errCode) return { sqlError: true, errMessage };
    if(error) return { sqlError: true, errMessage: error };
    let columnWidths = this.colWidth(columns),
        rowHeight = 50;
    if(rows[0].length === 1 && columns[0] === 'Error') rowHeight = 105;
    const headers = this.csvHeaders(columns);
    return {
      columns,
      rows,
      columnWidths,
      openTable: true,
      rowHeight,
      headers,
      rowData: csvRows,
      showProgress: false
    };
  }

  static setEditorMode({fontSize, vimMode, editor}) {
    const _id = editorConfig.recordId;
    if(vimMode) editor.setKeyboardHandler('ace/keyboard/vim');
    else editor.setKeyboardHandler('');
    return editorConfig.update({ _id, vimMode, fontSize });
  }

  static setAccounts(accounts): void {
    localStorage.setItem('accounts', JSON.stringify(accounts));
  }

  static accounts(): Account[] {
    let accounts: Account[] = JSON.parse(localStorage.getItem('accounts'));
    if(!accounts) {
      accounts = [{
        name: 'New', version: '8.5', host: '', username: '', password: '', selected: true,
        status: 'red'
      }];
      this.setAccounts(accounts);
    }
    return accounts;
  }

  static getAccounts(): Account[] {
    return this.accounts();
  }

  static getAccount(): Account {
    let accounts = this.accounts();
    return accounts.find(account => account.selected);
  }

  static getQueries() {
    return new Promise((resolve, reject) => {
      const ROOT_DIR = path.resolve(__dirname, '../.data');
      fs.readFile(`${ROOT_DIR}/.cucm-query`, 'utf-8', (err, data:string) => {
        let temp: string[] = data.replace(/\}/gi, '}}').split('}\n');
        temp.pop();
        const queries = temp.map(t => JSON.parse(t));
        return resolve(queries);
      });
    });
  }

  static uploadQueries(file: any) {
    return new Promise(resolve => fs.readFile(
      file.path, (e, data) => resolve(JSON.parse(data.toString()))
    ))
  }
}

export interface Account {
  name: string;
  version: string;
  host: string;
  username: string;
  password: string;
  selected: boolean;
  status: string;
}