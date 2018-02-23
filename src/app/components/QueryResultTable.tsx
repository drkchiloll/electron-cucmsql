import {
  React, Table, Column, Cell, TextField, $
} from './index';

export class QueryResultTable extends React.Component<any, any> {
  editRow = (e, rowIndex) => {
    const { id } = e.target;
    const divId = $(`#${id}`),
      textFieldClass = $(`.${id}`)[0];
    $(divId).toggle();
    $(textFieldClass).toggle();
    setTimeout(() => $(`input[name="${id}"`).focus(), 0);
  }

  render() {
    const { rows, columns, rowHeight, editorWidth, columnWidths } = this.props;
    return (
      <Table
        rowsCount={rows[0].length}
        rowHeight={rowHeight}
        headerHeight={50}
        width={editorWidth}
        height={500}
        onColumnResizeCallback={(width, colKey) => {
          columnWidths[colKey] = width;
          this.props.resizeColumn(columnWidths);
        }}
        isColumnResizing={false}
        onRowDoubleClick={this.editRow}
      >
        {
          columns.map((col, i) => {
            return (
              <Column
                key={`${col}_${i}`}
                columnKey={col}
                header={col}
                width={columnWidths[col]}
                cell={({rowIndex, width, height}) => {
                  return (
                    <Cell
                      columnKey={col}
                      height={height}
                      width={width}
                      rowIndex={rowIndex}>
                      <div id={`col_${i}_row_${rowIndex}`}>
                        {rows[i][rowIndex][col]}
                      </div>
                      <TextField
                        name={`col_${i}_row_${rowIndex}`}
                        style={{ display: 'none', fontSize: 12 }}
                        value={rows[i][rowIndex][col]}
                        underlineShow={false}
                        className={`col_${i}_row_${rowIndex}`}
                        onChange={(e, newValue) => {
                          rows[i][rowIndex][col] = newValue;
                          this.props.rowChange(rows);
                        }}
                        onBlur={() => {
                          $(`.col_${i}_row_${rowIndex}`).toggle();
                          $(`#col_${i}_row_${rowIndex}`).toggle();
                        }} />
                    </Cell>
                  )
                }} />
            )
          })
        }
      </Table>
    );
  }
}