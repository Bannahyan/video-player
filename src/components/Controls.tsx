import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AiFillCaretRight, AiOutlinePause } from 'react-icons/ai';
import { FaVolumeUp, FaVolumeMute, FaVolumeDown } from 'react-icons/fa';
import { MdFullscreen, MdOutlineReplay } from 'react-icons/md';
import styles from '../styles/home.module.css';

interface ControlsProps {
  durationOfVideo: number;
  currentDurationOfVideo: number;
  videoDuration: React.ChangeEventHandler<HTMLInputElement>;
  videoReplay: React.MouseEventHandler<HTMLButtonElement>;
  handleTogglePlay: React.MouseEventHandler<HTMLButtonElement>;
  isPaused: boolean;
  videoElement: HTMLVideoElement | null;
}

const Controls = ({
  durationOfVideo,
  currentDurationOfVideo,
  videoDuration,
  videoReplay,
  handleTogglePlay,
  isPaused,
  videoElement,
}: ControlsProps) => {
  const [volumeOfVideo, setVolumeOfVideo] = useState(50);
  const [muted, setMuted] = useState(false);
  const isReplayButton =
    currentDurationOfVideo === durationOfVideo && currentDurationOfVideo !== 0;

  const fullScreenRef = useRef<HTMLButtonElement | null>(null);

  const orientationChange = useCallback(() => {
    if (screen.orientation.type.includes('landscape')) {
      if (videoElement) {
        videoElement.requestFullscreen({
          navigationUI: 'auto',
        });
      }
      // else if (elem?.mozRequestFullScreen) {
      //   elem?.mozRequestFullScreen();
      // } else if (elem?.webkitRequestFullscreen) {
      //   elem?.webkitRequestFullscreen();
      // } else if (elem.msRequestFullscreen) {
      //   elem.msRequestFullscreen();
      // }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }
  }, [videoElement]);

  useEffect(() => {
    // Listen for the window.orientationchange event
    window.addEventListener('orientationchange', orientationChange);
    // Clean up the event listener
    return () => {
      window.removeEventListener('orientationchange', orientationChange);
    };
  }, [orientationChange]);

  const handleChangeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMuted(false);
    if (videoElement) {
      const volume = e.target.value;
      const volumeValue = parseFloat(volume) / 100;
      setVolumeOfVideo(parseFloat(volume));
      videoElement.volume = parseFloat(volumeValue.toFixed(1));
      if (!parseFloat(volume)) {
        setMuted(true);
      }
    }
  };

  const handdleToggleMute = () => {
    if (videoElement) {
      if (muted) {
        videoElement.muted = false;
      } else {
        videoElement.muted = true;
      }
      setMuted(prev => !prev);
    }
  };

  const handleToggleFullScreen = () => {
    if (videoElement) {
      if (videoElement.requestFullscreen) {
        videoElement.requestFullscreen({
          navigationUI: 'auto',
        });
      }
      // else if (videoElement.mozRequestFullScreen) { // For older versions of Firefox
      //   videoElement.mozRequestFullScreen();
      // } else if (videoElement.webkitRequestFullscreen) { // For older versions of Chrome, Safari and Opera
      //   videoElement.webkitRequestFullscreen();
      // }
    }
  };

  return (
    <div className={styles.controls}>
      <input
        type='range'
        min='0'
        max={durationOfVideo}
        value={currentDurationOfVideo}
        onChange={videoDuration}
        className={styles.progressBar}
      />
      <div className={styles.controlsWrapper}>
        <div className={styles.controlsLeft}>
          <button
            onClick={isReplayButton ? videoReplay : handleTogglePlay}
            className={styles.button}
          >
            {isReplayButton ? (
              <MdOutlineReplay color='white' size={24} />
            ) : isPaused ? (
              <AiFillCaretRight color='white' size={24} />
            ) : (
              <AiOutlinePause color='white' size={24} />
            )}
          </button>
          <button className={styles.button} onClick={handdleToggleMute}>
            {muted ? (
              <FaVolumeMute color='white' size={24} />
            ) : volumeOfVideo > 50 ? (
              <FaVolumeUp color='white' size={24} />
            ) : (
              <FaVolumeDown color='white' size={24} />
            )}
          </button>
          <input
            type='range'
            min='0'
            max='100'
            step='1'
            value={muted ? 0 : volumeOfVideo}
            onChange={handleChangeVolume}
            className={styles.volumeBar}
          />
        </div>
        <button
          className={styles.fullScreenButton}
          onClick={handleToggleFullScreen}
          ref={fullScreenRef}
        >
          <MdFullscreen color='white' size={24} />
        </button>
      </div>
    </div>
  );
};

export default Controls;
