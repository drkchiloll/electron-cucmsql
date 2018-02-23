import { React, Drawer, Subheader, Queries } from './index';

const styles: any = {
  drawer : {
    marginTop: 80,
    backgroundColor: '#d7dddd'
  },
  div: { marginLeft: 20 }
};

export const QuerySidePanel = (props: any) =>
  <Drawer open={true} width={props.drawerWidth} containerStyle={styles.drawer}>
    <div style={styles.div}>
      <Subheader> Query List </Subheader>
      <Queries 
        queries={props.queries}
        change={props.change}
        selectedQuery={props.selectedQuery} />
    </div>
  </Drawer>