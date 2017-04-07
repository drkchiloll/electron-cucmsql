import template from './template';
import * as Promise from 'bluebird';
import * as request from 'request';
import { DOMParser as dom } from 'xmldom';

export class CucmSql {
  readonly doc = template;
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
    const doc = new dom().parseFromString(data);
    let rows = Array.from(doc.getElementsByTagName('row'));
    return Promise.map(rows, row => {
      return Array.from(row.childNodes).reduce((o, child) => {
        o[child.nodeName] = child.textContent;
        return o;
      }, {})
    });
  }

  query(statement:string) {
    return this._req(this._options(
      this.setDoc({action:'Query', statement})
    )).then(this.parseResp);
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
      auth: {user: this.profile.user, pass: this.profile.pass},
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
  user:string;
  pass:string;
  host:string;
  version:string;
}