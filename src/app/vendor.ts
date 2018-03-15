// Import 3rd Parties
import 'font-awesome/css/font-awesome.min.css';
// FIXED-DATA-TABLE
import 'fixed-data-table-2/dist/fixed-data-table.min.css';
// Perform Some Initialization of the API
import { Api } from './lib/api';
export declare let editorConfig;

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as Promise from 'bluebird';

editorConfig = new Api({
  db: 'editorDb', dbName: 'editor-config'
});
editorConfig.get().then((settings:any) => {
  if(settings.length === 0) {
    let vimMode = false,
        fontSize = 18;
    editorConfig.vimMode = vimMode;
    editorConfig.fontSize = fontSize;
    editorConfig.add({ vimMode, fontSize });
  } else {
    let [ { vimMode, fontSize, _id } ] = settings;
    editorConfig.recordId = _id;
    editorConfig.vimMode = vimMode;
    editorConfig.fontSize = fontSize;
  }
});

(() => {
  const ROOT_DIR = path.resolve(__dirname);
  const FILES = fs.readdirSync(ROOT_DIR);
  let ENV: string = 'production';
  if(FILES.findIndex(f => f.includes('.js.map')) !== -1) ENV = 'development';
  let updates: any;
  const parseContent = (content: any) => Promise
    .filter(content, (c: any) =>
      c.name.includes('bundle.js') || c.name === 'index.html')
    .then((files) => Promise.map(files, (file: any) =>
      ({name: file.name, uri: file.git_url})));

  axios.defaults.baseURL = 'https://api.github.com/repos/drkchiloll/sequelizer-updator';
  axios.defaults.headers['Authorization'] = `Bearer 3d8bf3e0624d88088138c26cb5f9a7c0b90f6a6a`;

  if(ENV === 'production') {
    // Get the Contents First
    axios
      .get('/contents')
      .then(({ data }) => parseContent(data))
      .then(files => Promise.map(files, (file: any) => axios.get(file.uri).then(({ data }) =>
        Object.assign(file, {
          content: new Buffer(data.content, 'base64').toString('utf-8')
        }))))
      .then((results: any) => {
        updates = results;
        const files = fs.readdirSync(ROOT_DIR);
        return Promise.reduce(updates, (b: boolean, update: any) => {
          if(b) return b;
          if(files.indexOf(update.name) !== -1) {
            let content = fs.readFileSync(ROOT_DIR + '/' + update.name, 'utf-8');
            if(content != update.content) b = true;
            else b = false;
            return b;
          }
          b = false;
          return b;
        }, false);
      }).then((willUpdate: boolean) => {
        if(willUpdate) {
          return Promise.reduce(updates, (b, update: any) => {
            fs.writeFileSync(`${ROOT_DIR}/${update.name}`, update.content, 'utf-8');
            return b;
          }, true)
        } else {
          return false;
        }
      }).then(willReload => {
        if(willReload) {
          alert('Your App Was Updated and will Automatically Reload Now');
          window.location.reload();
        }
      });
  }
})();