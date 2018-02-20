// Import 3rd Parties
import 'font-awesome/css/font-awesome.min.css';
// FIXED-DATA-TABLE
import 'fixed-data-table-2/dist/fixed-data-table.min.css';
// Perform Some Initialization of the API
import { Api } from './lib/api';
export declare let editorConfig;

editorConfig = new Api({
  db: 'editorDb', dbName: 'editor-config'
});
editorConfig.get().then((settings:any) => {
  if(settings.length === 0) {
    let vimMode = false,
        fontSize = 18;
    editorConfig.vimMode = vimMode;
    editorConfig.fontSize = fontSize;
    editorConfig.add({ vimMode, fontSize });
  } else {
    let [ { vimMode, fontSize, _id } ] = settings;
    editorConfig.recordId = _id;
    editorConfig.vimMode = vimMode;
    editorConfig.fontSize = fontSize;
  }
});