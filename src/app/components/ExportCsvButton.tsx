import { React, CsvCreator, FlatButton, FontIcon } from './index';

const styles: any = {
  main: { width: 50 },
  icon: {
    fontSize: 18,
    top: 2
  }
};

export function ExportCsvButton(props: any) {
  return (
    <div style={styles.main}>
      <CsvCreator
        filename='export'
        headers={props.headers}
        rows={props.rows}
      >
        <FlatButton 
          label='EXPORT'
          labelPosition='before'
          primary={true}
          icon={
            <FontIcon
              color='blue'
              className='fa fa-external-link'
              style={styles.icon} />
          } />
      </CsvCreator>
    </div>
  );
}