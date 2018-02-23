import { React, Toggle } from './index';

const styles: any = {
  main: { float: 'right' },
  track: { backgroundColor: 'red' },
  thumb: { backgroundColor: '#ffcccc' },
  thumbSwitch: { backgroundColor: '#72d86e' },
  trackSwitch: { backgroundColor: 'green' },
};

export function VimToggle(props: any) {
  return (
    <div style={styles.main}>
      <Toggle
        label='Vim Mode'
        toggled={props.vimMode}
        trackStyle={styles.track}
        thumbStyle={styles.thumb}
        thumbSwitchedStyle={styles.thumbSwitch}
        trackSwitchedStyle={styles.trackSwitch}
        onToggle={props.set} />
    </div>
  );
}