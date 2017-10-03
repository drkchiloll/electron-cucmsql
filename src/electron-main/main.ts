import * as electron from 'electron';
import {
  app, BrowserWindow, Menu
} from 'electron';
import { AppMenu } from './menu';

import { Api, Promise } from '../app/components';

class CucmSqlQueryTool {
  mainWindow: Electron.BrowserWindow;

  constructor(
    public app: Electron.App
  ) {
    this.app.on('ready', this._onReady);
    this.app.on(
      'window-all-closed',
      this._onWindowAllClosed
    );
  }

  _onReady() {
    this.mainWindow = new BrowserWindow({
      width:1024,
      height:768,
      minWidth:1024,
      minHeight:600,
      acceptFirstMouse:true
    });

    this.mainWindow.loadURL(`file://${__dirname}/index.html`);
    this.mainWindow.on('closed', () => this.mainWindow = null);
    Menu.setApplicationMenu(AppMenu);
  }

  _onWindowAllClosed() {
    if(process.platform != 'darwin') {
      app.quit();
    }
  }
}

const sqlApp = new CucmSqlQueryTool(app);