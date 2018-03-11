import * as React from 'react';
import { Dialog, FlatButton } from './index';
import { RaisedButton } from 'material-ui';

const styles: any = {
  dialog: {
    width: 600,
    margin: '25px 0 0 25%',
    top: -250
  }
};

export function CsvUploadPopup(props: any) {
  return (
    <Dialog open={true}
      title='Upload File'
      modal={true}
      style={styles.dialog}
      actions={[
        <FlatButton label='Cancel'
          primary={true}
          onClick={props.close} />
      ]}>
      <RaisedButton label='Add'
        containerElement='label'>
        <input name='myFile' type='file' id='csv-upload'
          onChange={props.upload} style={{display: 'none'}} />
      </RaisedButton>
    </Dialog>
  )
}