import * as React from 'react';
import { Dialog, FlatButton, TextField } from 'material-ui';

const styles: any = {
  dialog: {
    width: 600,
    margin: '25px 0 0 25%',
    top: -250
  }
};

export function SaveQueryPopup(props: any) {
  return (
    <Dialog open={true}
      title='Save Query'
      modal={true}
      style={styles.dialog}
      actions={[
        <FlatButton label='Cancel'
          primary={true}
          onClick={props.close} />,
        <FlatButton label='Save'
          primary={true}
          onClick={props.save} />
      ]} >
      <TextField hintText='Unique Name for Query'
        name='query-name'
        autoFocus
        underlineShow={true}
        floatingLabelFixed={true}
        value={props.queryName}
        onChange={(e, val) => props.change(val)} />
    </Dialog>
  );
}