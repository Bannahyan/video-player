import React, { useState, useRef, useMemo } from 'react';
import { AiFillCaretRight, AiOutlinePause } from 'react-icons/ai';
import { FaVolumeUp, FaVolumeMute, FaVolumeDown } from 'react-icons/fa';
import {
  MdFullscreen,
  MdOutlineReplay,
  MdFullscreenExit,
} from 'react-icons/md';
import styles from './styles.module.css';

interface ControlsProps {
  durationOfVideo: number;
  currentDurationOfVideo: number;
  handleChangeCurrentDuration: React.ChangeEventHandler<HTMLInputElement>;
  handleTogglePlay: React.MouseEventHandler<HTMLButtonElement>;
  isPaused: boolean;
  videoElement: HTMLVideoElement | null;
  handleToggleFullScreen: React.MouseEventHandler<HTMLButtonElement>;
  isFullScreen: boolean;
}

const Controls = ({
  durationOfVideo,
  currentDurationOfVideo,
  handleChangeCurrentDuration,
  handleTogglePlay,
  isPaused,
  videoElement,
  handleToggleFullScreen,
  isFullScreen,
}: ControlsProps) => {
  const [volumeOfVideo, setVolumeOfVideo] = useState(50);
  const [muted, setMuted] = useState(false);
  const fullScreenRef = useRef<HTMLButtonElement | null>(null);

  const isReplayButton = useMemo(() => {
    return (
      currentDurationOfVideo >= durationOfVideo && currentDurationOfVideo !== 0
    );
  }, [currentDurationOfVideo, durationOfVideo]);

  //handling volume change event
  const handleChangeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMuted(false);
    if (videoElement) {
      videoElement.muted = false;
      const volume = e.target.value;
      const volumeValue = parseFloat(volume) / 100;
      setVolumeOfVideo(parseFloat(volume));
      videoElement.volume = parseFloat(volumeValue.toFixed(1));
      if (!parseFloat(volume)) {
        setMuted(true);
      }
    }
  };

  //handling mute/unmute button click
  const handleToggleMute = () => {
    if (videoElement) {
      if (muted) {
        videoElement.muted = false;
      } else {
        videoElement.muted = true;
      }
      setMuted(prev => !prev);
    }
  };

  return (
    <div className={styles.controls}>
      <input
        type='range'
        min='0'
        max={durationOfVideo.toString()}
        value={currentDurationOfVideo}
        onChange={handleChangeCurrentDuration}
        className={styles.scrubber}
      />
      <div className={styles.controlsWrapper}>
        <div className={styles.controlsLeft}>
          <button onClick={handleTogglePlay}>
            {isReplayButton ? (
              <MdOutlineReplay color='white' />
            ) : isPaused ? (
              <AiFillCaretRight color='white' />
            ) : (
              <AiOutlinePause color='white' />
            )}
          </button>
          <div className={styles.volumeControls}>
            <button onClick={handleToggleMute}>
              {muted ? (
                <FaVolumeMute color='white' />
              ) : volumeOfVideo > 50 ? (
                <FaVolumeUp color='white' />
              ) : (
                <FaVolumeDown color='white' />
              )}
            </button>
            <input
              type='range'
              min='0'
              max='100'
              step='1'
              value={muted ? 0 : volumeOfVideo}
              onChange={handleChangeVolume}
            />
          </div>
        </div>
        <button onClick={handleToggleFullScreen} ref={fullScreenRef}>
          {isFullScreen ? (
            <MdFullscreenExit color='white' />
          ) : (
            <MdFullscreen color='white' />
          )}
        </button>
      </div>
    </div>
  );
};

export default Controls;
