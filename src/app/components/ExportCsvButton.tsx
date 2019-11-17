import { React, FlatButton, FontIcon } from './index';
import * as CsvCreator from 'react-csv-creator';

const styles: any = {
  main: { width: 50 },
  icon: {
    fontSize: 18,
    top: 2
  }
};

export class ExportCsvButton extends React.Component<any, any> {
  render() {
    return (
      <div style={styles.main}>
        <CsvCreator
          filename='export'
          headers={this.props.headers}
          rows={this.props.rows}
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
}