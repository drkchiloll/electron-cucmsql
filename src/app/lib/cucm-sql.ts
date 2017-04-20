import template from './template';
import * as Promise from 'bluebird';
import * as request from 'request';
import { DOMParser as dom } from 'xmldom';

export class CucmSql {
  readonly doc = template;
  profile:ICucmSql;
  constructor(params:ICucmSql) {
    console.log(params);
    this.profile = params;
  }

  setDoc(params:any) {
    return this.doc
      .replace(/\%version\%/gi, this.profile.version)
      .replace(/\%statement\%/gi, params.statement)
      .replace(/\%action\%/gi, params.action);
  }

  parseResp(data:string) {
    const doc = new dom().parseFromString(data);
    let rows = Array.from(doc.getElementsByTagName('row'));
    return Promise.map(rows, row => {
      return Array.from(row.childNodes).reduce((o, child) => {
        o[child.nodeName] = child.textContent;
        return o;
      }, {})
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

  columnize(data:any) {
    let keys = Object.keys(data[0]);
    return Promise.map(keys, (key) => ({
      key, name: key, editable: true, resizeable: true
    }))
  }

  rowify(data:any) {
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

  query(statement:string) {
    return this._req(this._options(
      this.setDoc({action:'Query', statement})
    )).then((data:string) => 
      this.parseResp(data)
    ).then((moreData) => {
      return Promise.all([
        this.columnize(moreData), this.rowify(moreData)
      ]);
    }).then(results => {
      return {
        columns: results[0],
        rows: results[1]
      };
    });
  }

  update(statement:string) {}

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
      body
    };
  }

  private _req(options:any) {
    return new Promise((resolve, reject) => {
      request(options, (err, res, body) => {
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