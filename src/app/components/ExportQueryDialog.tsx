import { React, Dialog, $ } from './index';

export class ExportQuery extends React.Component<any, any> {
  componentDidMount() {
    const { filename, queries } = this.props;
    if(filename && queries) {
      setTimeout(() => $('#export-queries')[0].click(), 500);
    }
  }

  render() {
    const { filename, queries } = this.props;
    const blob = new Blob([JSON.stringify(queries)], { type: "text/plain" });
    const uri = URL.createObjectURL(blob);
    return (
      <a id='export-queries' download={`${filename || ''}.txt`} href={uri || ''} />
    );
  }
}