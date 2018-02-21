import template from './template';
import * as Promise from 'bluebird';
import * as request from 'request';
import { DOMParser as dom } from 'xmldom';

export class CucmSql {
  readonly doc = template;
  readonly testAxlQuery: string = (
    `select skip 0 first 1 version from componentversion\n` +
    `where softwarecomponent="master"`
  );
  profile:ICucmSql;

  constructor(params:ICucmSql) {
    this.profile = params;
  }

  setDoc(params:any) {
    return this.doc
      .replace(/\%version\%/gi, this.profile.version)
      .replace(/\%statement\%/gi, params.statement)
      .replace(/\%action\%/gi, params.action);
  }

  parseResp(data:string) {
    console.log(data);
    const doc = new dom().parseFromString(data);
    let rows = Array.from(doc.getElementsByTagName('row'));
    if(rows && rows.length === 0) {
      return [];
    }
    return Promise.map(rows, row => {
      return Array.from(row.childNodes).reduce((o, child) => {
        o[child.nodeName] = child.textContent;
        return o;
      }, {})
    }).then((object:any) => {
      console.log(object);
      return object;
    });
  }

  parseErrorResp(data:any) {
    if(data.statusCode === 599) {
      return new Promise((resolve, reject) => {
        resolve({ error: 'AXL Version Error' });
      });
    } else if(data && data.error) {
      return new Promise((resolve, reject) => reject(data));
    }
    const doc = new dom().parseFromString(data.body);
    let errCode, errMessage;
    if(doc.getElementsByTagName('axlcode').length >= 1) {
      errCode = doc.getElementsByTagName('axlcode')[0].textContent;
      errMessage = doc.getElementsByTagName('axlmessage')[0].textContent;
    } else {
      errCode = 'none';
      errMessage = 'No Errors';
    }
    return new Promise((resolve,reject) => {
      resolve({
        columns: ['Error'],
        rows: [ [{ Error: `AxlError: ${errCode} ${errMessage}` }] ]
      });
    });
  }

  gridify(data:any) {
    let keys = Object.keys(data[0]);
    return Promise.all([
      keys.map(value => ({ value })),
      data.reduce((a,obj,i) => {
        a.push(keys.map(value => ({value: obj[value]})));
        return a;
      },[])
    ]).then(results => {
      results[1].unshift(results[0]);
      return results[1];
    })
  }

  dataGridColumnize(data:any) {
    let keys = Object.keys(data[0]);
    return Promise.map(keys, (key) => ({
      key, name: key, editable: true, resizeable: true
    }))
  }

  fixDataGridColumnize(data:any) {
    return Object.keys(data[0]);
  }

  dataGridRowify(data:any) {
    let keys = Object.keys(data[0]);
    return Promise.reduce(data, (a, o, i) => {
      return Promise.reduce(keys, (ob, key, i) => {
        if(i===0) {
          ob['id'] = o[key];
          ob[key] = o[key];
        }
        else ob[key] = o[key];
        return ob;
      },{}).then((object) => {
        a.push(object);
        return a;
      });
    }, []);
  }

  fixedDataRowify(data:any) {
    let keys = Object.keys(data[0]);
    return Promise.reduce(keys, (a, key) => {
      return Promise.map(data, (obj) => {
        let o = {};
        o[key] = obj[key];
        return o;
      }).then((arrs) => {
        a.push(arrs);
        return a;
      })
    }, []);
  }

  query(statement:string, simple:boolean=false) {
    let doc = this.setDoc({action:'Query', statement});
    // console.log(doc);
    let csvRows:any;
    return this._req(this._options(doc))
      .then((data:string) => this.parseResp(data))
      .then((moreData:any) => {
        if(simple) return moreData;
        if(moreData.length === 0) return undefined;
        csvRows = moreData;
        return Promise.all([
          this.fixDataGridColumnize(moreData), this.fixedDataRowify(moreData)
        ]);
      })
      .then((results:any) => {
        if(results && simple) return results;
        if(!results) {
          results = [];
          results[0] = ['RESULT'];
          results[1] = [[{RESULT: 'No Results from Query'}]];
        }
        return {
          columns: results[0],
          rows: results[1],
          csvRows
        };
      }).catch(this.parseErrorResp);
  }

  update(statement:string) {
    let doc = this.setDoc({ action: 'Update', statement });
    // console.log(doc);
    return this._req(this._options(doc)).then((data:string) => {
      // console.log(data);
      return data;
    })
  }

  private _options(body:string) {
    return {
      uri: `https://${this.profile.host}:8443/axl/`,
      headers: {
        'Content-Type':'text/xml',
        'SOAPAction':`CUCM:DB ver=${this.profile.version}`
      },
      strictSSL: false,
      method: 'POST',
      auth: {user: this.profile.username, pass: this.profile.password},
      body,
      timeout: 7500
    };
  }

  private _req(options:any) {
    return new Promise((resolve, reject) => {
      request(options, (err, res, body) => {
        if(err) return reject({ error: err });
        if(res.statusCode >= 500 && res.statusCode <= 599) return reject(res);
        if(res.statusCode===200) return resolve(body);
        return resolve();
      });
    });
  }
}

export interface ICucmSql {
  username:string;
  password:string;
  host:string;
  version:string;
}