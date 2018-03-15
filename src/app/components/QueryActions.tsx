import * as React from 'react';
import {
  BottomNavigation, BottomNavigationItem, $, Api, Promise
} from './index';
import { Utils } from '../lib/utils';
import * as fs from 'fs';
import { ExportQuery } from './ExportQueryDialog';
import { CsvUploadPopup } from './CsvUploadPopup';

const styles: any = {
  nav: { backgroundColor: '#d7dddd', height: 75 },
  sqlIco: { margin: '10px 0 0 15px' },
};

export class QueryActions extends React.Component<any, any> {
  state = {
    filename: null,
    queries: null,
    queryUpload: false
  }

  render() {
    const { newQuery, save, clear, exec, showFile, accountName } = this.props,
      { filename, queries, queryUpload } = this.state;
    return (
      <div>
        <BottomNavigation style={styles.nav}>
          <BottomNavigationItem label={<strong>{accountName}</strong>}
            icon={
              <span className='fa-stack fa-lg'>
                <i className='fa fa-user fa-stack-2x' />
              </span>
            }
          />
          <BottomNavigationItem label='Execute SQL'
            icon={
              <span className='fa-stack fa-lg'>
                <i className='fa fa-database fa-stack-2x fa-inverse' />
                <i className='fa fa-play-circle fa-stack-1x' style={styles.sqlIco} />
              </span>
            }
            onClick={exec} />
          <BottomNavigationItem
            className='new-query'
            icon={
              <span className="fa-stack fa-lg">
                <i className="fa fa-square fa-stack-2x"></i>
                <i className="fa fa-terminal fa-stack-1x fa-inverse"></i>
              </span>
            }
            label='New Query'
            onClick={newQuery} />
          <BottomNavigationItem
            className='save-query'
            icon={
              <span className='fa-stack fa-lg'>
                <i className='fa fa-hdd-o fa-stack-2x' />
              </span>
            }
            label='Save Query'
            onClick={save} />
          <BottomNavigationItem
            className='reset-query'
            icon={
              <span className='fa-stack fa-lg'>
                <i className='fa fa-refresh fa-lg' />
              </span>
            }
            label='Reset Query'
            onClick={() => window.location.reload()} />
          <BottomNavigationItem
            className='upload-csv'
            icon={
              <span className='fa-stack fa-lg'>
                <i className='fa fa-cloud-upload fa-lg' />
              </span>
            }
            label='Upload CSV'
            onClick={showFile} />
          <BottomNavigationItem
            className='import-queries'
            icon={
              <span className='fa-stack fa-lg'>
                <i className='fa fa-upload fa-lg' />
              </span>
            }
            label='Import Queries'
            onClick={() => this.setState({ queryUpload: true })} />
          <BottomNavigationItem
            className='export-queries'
            icon={
              <span className='fa-stack fa-lg'>
                <i className='fa fa-external-link fa-lg' />
              </span>
            }
            label='Export Queries'
            onClick={() => {
              Utils.getQueries().then((queries: any) => {
                const filename = 'query_export';
                this.setState({ filename, queries });
              });
            }} />
        </BottomNavigation>
        {
          filename && queries ?
            <ExportQuery {...this.state} cancel={this.cancelExport} /> :
            queryUpload ?
              <CsvUploadPopup close={this.closeQueryUpload} upload={this.queryUpload} /> :
              null
        }
      </div>
    )
  }

  cancelExport = () => this.setState({ filename: null, queries: null });

  closeQueryUpload = () => this.setState({ queryUpload: false });

  queryUpload = () => {
    this.closeQueryUpload();
    let file = $('#csv-upload').prop('files')[0],
      text = fs.readFileSync(file.path).toString();
    const queries = JSON.parse(text);
    return Promise.each(queries, query => {
      return this.props.import(query);
    });
  }
}
