import * as React from 'react';
import { BottomNavigation, BottomNavigationItem } from './index';
import { Utils } from '../lib/utils';
import * as fs from 'fs';
import { ExportQuery } from './ExportQueryDialog';
const styles: any = {
  nav: { backgroundColor: '#d7dddd', height: 75 },
  sqlIco: { margin: '10px 0 0 15px' },
};

export class QueryActions extends React.Component<any,any> {
  state= {
    filename: null,
    queries: null
  }

  render() {
    const { newQuery, save, clear, exec, showFile, accountName } = this.props,
      { filename, queries } = this.state;
    return (
      <div>
        <BottomNavigation style={styles.nav}>
          <BottomNavigationItem label={<strong>{accountName}</strong>}
            style={{ marginTop: '10px' }}
            icon={<i className='fa fa-user-o fa-2x' />}
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
            onClick={() => {}}/>
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
        {filename && queries ? <ExportQuery {...this.state} /> : null }
      </div>
    )
  }
}
