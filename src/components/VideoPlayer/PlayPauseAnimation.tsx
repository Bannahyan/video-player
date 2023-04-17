import classNames from 'classnames';
import { AiFillCaretRight, AiOutlinePause } from 'react-icons/ai';
import styles from '../../styles/home.module.css';

interface PlayPauseProps {
  areaClicked: boolean;
  setAreaClicked: Function;
  handleTogglePlay: Function;
  isPaused: boolean;
}

const PlayPause = ({
  areaClicked,
  setAreaClicked,
  handleTogglePlay,
  isPaused,
}: PlayPauseProps) => {
  return (
    <div
      className={classNames(
        styles.playPauseIcon,
        areaClicked ? styles.visible : styles.hidden
      )}
      onClick={() => {
        setAreaClicked(true);
        handleTogglePlay();
      }}
    >
      {isPaused ? (
        <AiOutlinePause color='white' />
      ) : (
        <AiFillCaretRight color='white' />
      )}
    </div>
  );
};

export default PlayPause;
