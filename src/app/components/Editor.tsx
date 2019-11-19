import * as React from 'react';
import * as ace from 'brace';
import {
  AceEditor, $
} from './index';

export class Editor extends React.Component<any,any> {
  aceCommands = [{
    name: 'save',
    bindKey: { win: 'Ctrl-S', mac: 'Command-S' },
    exec: function() {
      const saveQuery: any = $('.save-query');
      saveQuery.get(0).click();
    }
  }, {
    name: 'new-query',
    bindKey: { win: 'Ctrl-N', mac: 'Command-N' },
    exec: () => {
      const newQuery: any = $('.new-query');
      return newQuery.get(0).click()
    }
  }]
  aceLoad = (editor) => {
    const Vim = ace.acequire('ace/keyboard/vim').CodeMirror.Vim;
    Vim.defineEx('write', 'w', (cm, inp) => this.props.save());
    this.props.init(editor);
  }
  
  commandChange = (sql) => {
    const { editor } = this.props;
    if(editor.getSelectionRange().end.row >= 23) {
      let row = editor.getSelectionRange().end.row + 1;
      console.log(row);
      editor.setOptions({ maxLines: row });
    } else if(editor.getSelectionRange().end.row < 23) {
      if(editor.setOptions.maxLines) {
        delete editor.setOptions.maxLines;
      }
    }
    this.props.change(sql);
  }

  render() {
    const {
      editor, fontSize, selectedStatement,
      aceFocus, editorWidth, editorHeight
    } = this.props;
    return (
      <AceEditor
        mode='mysql'
        theme='monokai'
        className='editor'
        focus={aceFocus}
        name='editor'
        width={`${editorWidth}px`}
        height={`${editorHeight}px`}
        tabSize={2}
        fontSize={fontSize}
        highlightActiveLine={false}
        value={selectedStatement}
        enableBasicAutocompletion={true}
        enableLiveAutocompletion={true}
        showPrintMargin={false}
        onLoad={this.aceLoad}
        onChange={this.commandChange}
        commands={this.aceCommands}
        editorProps={{ $blockScrolling: Infinity }} />
    );
  }
}