import {
  React, Paper, SelectableList, ListItem
} from './index';

const styles: any = {
  paper: {
    marginRight: 10,
    maxHeight: 968,
    overflow: 'auto',
    backgroundColor: '#d7dddd',
    height: 'auto'
  }
};

export function Queries(props: any) {
  const { queries } = props;
  return (
    <Paper zDepth={0} style={styles.paper}>
      <SelectableList value={props.selectedQuery} onChange={props.change}>
        { queries.map((query, i) =>
            <ListItem
              key={`query_${i}`}
              value={i}
              primaryText={query.name} /> ) }
      </SelectableList>
    </Paper>
  );
}