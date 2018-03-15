import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as Promise from 'bluebird';
import * as moment from 'moment';
import { Moment } from 'moment';

export class Updator {
  private static readonly ROOT_DIR = path.resolve(__dirname);
  private static readonly FILES = fs.readdirSync(path.resolve(__dirname));
  private static ENVIRONMENT: string;
  private static storedUpdate: string;
  private static lastUpdated: Moment;
  private static willUpdate: boolean;

  static init(): boolean {
    // Set the ENVIRONMENT we are operating in
    this.setENV();
    // Configure Default REQUEST Options
    axios.defaults.baseURL =
      'https://api.github.com/repos/drkchiloll/sequelizer-updator';
    axios.defaults.headers['Authorization'] =
      'Bearer 3d8bf3e0624d88088138c26cb5f9a7c0b90f6a6a';
    // Get the Last Stored Update
    this.storedUpdate = localStorage.getItem('lastUpdated');
    // Set the Stored Updated to a Moment so work can be DONE
    this.lastUpdated =
      this.storedUpdate ? moment(new Date(this.storedUpdate)) : null;
    // Are we going to Update the APP?
    this.willUpdate = this.ENVIRONMENT === 'development' ? false :
      this.ENVIRONMENT === 'production' && !this.lastUpdated ? true :
      (this.ENVIRONMENT === 'production' &&
        (moment().isAfter(this.lastUpdated) &&
          this.lastUpdated.add(1,'d').isSameOrAfter(moment()))) ? true :
      false;
    return this.willUpdate;
  };

  static setENV() {
    if(this.FILES.findIndex(f => f.includes('.js.map')) !== -1) {
      this.ENVIRONMENT = 'developement';
    } else {
      this.ENVIRONMENT = 'production';
    }
  };
  
  static filterRespository(content: any) {
    return Promise
      .filter(content, (c: any) =>
        c.name.includes('bundle.js') || c.name === 'index.html')
      .then(files => Promise.map(files, (file: any) =>
        ({ name: file.name, uri: file.git_url })
      ));
  };

  static getRepoContent() {
    return axios.get('/contents').then(({ data }) => data);
  };

  static processGhFiles(ghFiles: any[]) {
    return Promise.map(ghFiles, (ghFile: any) =>
      axios.get(ghFile.uri).then(({ data }) =>
        Object.assign(ghFile, {
          content: new Buffer(data.content, 'base64').toString('utf-8')
        })))
  };

  static localFileCompare(ghFiles) {
    const ROOT_DIR = path.resolve(__dirname);
    let toUpdate: boolean = false;
    return Promise.each(ghFiles, ({name, content}) => {
      const localFile = fs.readFileSync(`${ROOT_DIR}/${name}`, 'utf-8');
      toUpdate = localFile != content ? true : false;
      return;
    }).then(() => {
      if(toUpdate) return ghFiles;
      else return [];
    });
  };

  static update(ghFiles) {
    const ROOT_DIR = path.resolve(__dirname);
    if(ghFiles.length > 0) {
      return Promise.each(ghFiles, ({ name, content}) =>
        fs.writeFileSync(`${ROOT_DIR}/${name}`, content, 'utf-8')
      ).then(() => true);
    } else {
      return false;
    }
  }

  static setLastUpdated() {
    localStorage.setItem('lastUpdated', moment().format('MM/DD/YYYY h:mm a'));
    return Promise.resolve();
  }

  static startUpdate() {
    return this.setLastUpdated()
      .then(this.getRepoContent)
      .then(this.filterRespository)
      .then(this.processGhFiles)
      .then(this.localFileCompare)
      .then(this.update)
      .then((updated) => updated);
  };
}