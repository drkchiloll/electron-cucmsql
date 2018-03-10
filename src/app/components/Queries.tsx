import {
  React, Paper, SelectableList, ListItem
} from './index';

const styles: any = {
  paper: {
    position: 'absolute',
    marginRight: 10,
    overflow: 'auto',
    backgroundColor: '#d7dddd',
    height: 'auto',
    top: 40,
    bottom: 120
  }
};

export function Queries(props: any) {
  const { queries } = props;
  return (
    <Paper zDepth={0} style={styles.paper}>
      <SelectableList value={props.selectedQuery} onChange={props.change}>
        { queries.map((query, i) =>
            <ListItem
              style={{fontSize: '95%'}}
              key={`query_${i}`}
              value={i}
              primaryText={query.name} /> ) }
      </SelectableList>
    </Paper>
  );
}