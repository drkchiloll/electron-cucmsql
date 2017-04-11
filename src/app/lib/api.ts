import * as Promise from 'bluebird';
import * as path from 'path';
import * as fs from 'fs';
import * as Datastore from 'nedb';

const appOut = path.resolve(__dirname, '../../'),
      appIn = path.resolve(__dirname, '../');

export class Api {
  acctDb: Datastore;

  constructor(dbName:string) {
    let filename: string;
    if(fs.existsSync(`${appOut}/.data`)) {
      filename = `${appOut}/.data/.${dbName}`;
    } else {
      filename = `${appIn}/.data/.${dbName}`;
    }
    this.acctDb = new Datastore({ filename, autoload: true });
  }

  get() {
    return new Promise((resolve, reject) => {
      this.acctDb.find({}, (err, docs) => resolve(docs));
    });
  }

  add(record:any) {
    return new Promise((resolve, reject) => {
      this.acctDb.insert(record, (err, doc) => {
        return resolve(doc);
      });
    });
  }

  update(record:any) {
    let _id = JSON.parse(JSON.stringify(record))._id;
    delete record._id;

    return new Promise((resolve, reject) => {
      this.acctDb.update({ _id }, record, { upsert: true },
        (err:any, num:number) => {
          return resolve(num);
        });
    });
  }

  remove(_id:string) {
    return new Promise((resolve, reject) => {
      this.acctDb.remove({ _id }, {}, (err, num) => {
        return resolve(num);
      });
    });
  }
}