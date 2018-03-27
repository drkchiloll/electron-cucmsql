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
    this.app.setAboutPanelOptions({
      applicationVersion: '1.0.3',
      version: '1.0.3'
    });
  }

  _onReady() {
    this.mainWindow = new BrowserWindow({
      width:1024,
      height:968,
      minWidth:1024,
      minHeight:968,
      acceptFirstMouse:true
    });
    this.mainWindow.loadURL(`file://${__dirname}/index.html`);
    this.mainWindow.on('closed', () => this.mainWindow = null);
    Menu.setApplicationMenu(AppMenu);
  }

  _onWindowAllClosed() {
    app.quit();
  }
}

const sqlApp = new CucmSqlQueryTool(app);