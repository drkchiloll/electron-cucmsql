import axios from 'axios';
import { AxiosInstance } from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as Promise from 'bluebird';
import * as moment from 'moment';
import { Moment } from 'moment';

const url = 'https://api.github.com/repos/drkchiloll/',
  repo = 'sequelizer-updator',
  token = '3d8bf3e0624d88088138c26cb5f9a7c0b90f6a6a';

export interface IUpdator {
  setENV(): void;
  init(): boolean;
  filterRepoContent(files: any): any[];
  processRepoFiles(files: any): any[];
  fileCompare(files: any): any[];
  refresh(files: any): boolean;
  start(): boolean;
}

export interface GitHubFile {
  name: string;
  uri: string;
  content?: string;
}

export const Updator = (() => {
  const ROOT_DIR = path.resolve(__dirname),
    FILES = fs.readdirSync(ROOT_DIR),
    requestor = axios.create({
      baseURL: url + repo,
      headers: { Authorization: `Bearer ${token}` }
    });

  const update: any = {
    version: null,

    ENVIRONMENT: null,

    setUpdateDate() {
      localStorage.setItem('lastUpdated', moment().format('MM/DD/YYYY h:mm a'));
      return Promise.resolve('/contents');
    },

    req(uri) {
      return requestor.get(uri).then(({ data }) => data);
    },

    setENV() {
      return FILES.findIndex(f => f.includes('.js.map')) !== -1
        ? 'development' : 'production';
    },

    init() {
      this.ENVIRONMENT = this.setENV();
      let storedUpdate = localStorage.getItem('lastUpdated');
      let lastUpdated = storedUpdate ? moment(new Date(storedUpdate)) : null;
      return this.ENVIRONMENT === 'developement' ? false :
        this.ENVIRONMENT === 'production' && !lastUpdated ? true :
          this.ENVIRONMENT === 'production' && moment().isSameOrAfter(
            lastUpdated.add(1, 'd')) ? true : false;
    },

    filterRepoFiles(files: any): Promise<GitHubFile[]> {
      return Promise
        .filter(files, (f: any) =>
          f.name.includes('bundle.js') || f.name === 'index.html' ||
          f.name === 'version.json')
        .then(updates => Promise.map(updates, (update: any) =>
          ({ name: update.name, uri: update.git_url })));
    },

    getFileContent(uri: string) {
      return requestor.get(uri).then(({ data }) => ({
        content: new Buffer(data.content, 'base64').toString('utf-8')
      }));
    },

    processRepoFiles(files: GitHubFile[]) {
      if(!files) return null;
      return Promise.map(files, (file: any) =>
        this.getFileContent(file.uri).then(content =>
          Object.assign(file, content)));
    },

    compareAppVersions(files: GitHubFile[]) {
      const verIndx = files.findIndex(f => f.name==='version.json');
      return this.getFileContent(files[verIndx].uri)
        .then(({ content }) => {
          let { version } = JSON.parse(content),
            currentVersion = localStorage.getItem('currentVersion');
          this.version = version;
          if(!currentVersion) currentVersion = 'x';
          if(version != currentVersion) {
            localStorage.setItem('currentVersion', this.version);
            files.splice(verIndx, 1);
            return files;
          } else {
            return null;
          }
        })
    },

    refresh(files: GitHubFile[]) {
      if(files && files.length > 0) {
        return Promise.each(files, ({ name, content }) =>
          fs.writeFileSync(`${ROOT_DIR}/${name}`, content, 'utf-8')
        ).then(() => true);
      } else {
        return false;
      }
    }
  };

  return update;
})();

export function startUpdate() {
  return Updator.setUpdateDate()
    .then((repoContentEndpoint: string) =>
      Updator.req(repoContentEndpoint))
    .then((repoFiles: any) =>
      Updator.filterRepoFiles(repoFiles))
    .then((filteredFiles: GitHubFile[]) =>
      Updator.compareAppVersions(filteredFiles))
    .then(Updator.processRepoFiles)
    .then(Updator.refresh)
}