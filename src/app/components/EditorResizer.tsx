import * as React from 'react';
import { $, indigo900 } from './index';

const styles: any = {
  hr: {
    margin: 0,
    border: `3px solid ${indigo900}`
  }
};

export function EditorResizer(props: any) {
  return (
    <hr id='editorDivider'
      style={styles.hr}
      draggable={true}
      onMouseOver={() =>
        $('#editorDivider').css('cursor', 'row-resize')}
      onMouseOut={() =>
        $('#editorDivider').css('cursor', 'row-resize')}
      onDragEnd={(e) => {
        if(e.pageY === 0) return;
        let editorHeight = (200 + e.pageY - 285 + 1).toString();
        props.changeHeight(editorHeight);
        $('#editorDivider').css('cursor', 'pointer');
      }} />
  );
}