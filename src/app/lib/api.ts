import * as Promise from 'bluebird';
import * as path from 'path';
import * as fs from 'fs';
import * as Datastore from 'nedb-core';

const appOut = path.resolve(__dirname, '../../'),
      appIn = path.resolve(__dirname, '../');

export class Api {
  acctDb: Datastore;
  queryDb: Datastore;
  editorDb: Datastore;
  dbInstance:string;

  constructor({db, dbName}) {
    let filename: string;
    if(fs.existsSync(`${appOut}/.data`)) {
      filename = `${appOut}/.data/.${dbName}`;
    } else {
      filename = `${appIn}/.data/.${dbName}`;
    }
    this.dbInstance = db;
    this[db] = new Datastore({ filename, autoload: true });
  }

  get(query={}) {
    return new Promise((resolve, reject) => {
      this[this.dbInstance].find(query, (err, docs) =>
        resolve(docs));
    });
  }

  add(record:any) {
    return new Promise((resolve, reject) => {
      this[this.dbInstance].insert(record, (err, doc) => {
        return resolve(doc);
      });
    });
  }

  update(record:any) {
    let _id = JSON.parse(JSON.stringify(record))._id;
    return new Promise((resolve, reject) => {
      this[this.dbInstance].update({ _id }, record, { upsert: false },
        (err:any, num:number) => {
          return resolve(num);
        });
    });
  }

  remove(_id:string) {
    return new Promise((resolve, reject) => {
      this[this.dbInstance].remove({ _id }, {}, (err, num) => {
        return resolve(num);
      });
    });
  }

  defaultQuery() {
    return [{
      name: 'Show Description from Device',
      query: `SELECT description from device\nwhere device='SEP00112233445566'`
    }];
  }
}

export interface IAccount {
  name:string;
  host:string;
  version:string;
  username:string;
  password:string;
  selected:boolean;
}

export interface IQuery {
  name:string;
  query:string;
}

export interface IEditorSettings {
  vimMode:boolean;
  fontSize:number;
}