import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { AiFillCaretRight, AiOutlinePause } from 'react-icons/ai';
import { FaVolumeUp, FaVolumeMute, FaVolumeDown } from 'react-icons/fa';
import { MdFullscreen, MdOutlineReplay } from 'react-icons/md';
import styles from './styles.module.css';

interface ControlsProps {
  durationOfVideo: number;
  currentDurationOfVideo: number;
  videoDuration: React.ChangeEventHandler<HTMLInputElement>;
  handleTogglePlay: React.MouseEventHandler<HTMLButtonElement>;
  isPaused: boolean;
  videoElement: HTMLVideoElement | null;
}

interface DocumentElementWithFullscreen extends HTMLElement {
  msRequestFullscreen?: () => void;
  mozRequestFullScreen?: () => void;
  webkitRequestFullscreen?: () => void;
  webkitEnterFullscreen?: () => void;
}

const Controls = ({
  durationOfVideo,
  currentDurationOfVideo,
  videoDuration,
  handleTogglePlay,
  isPaused,
  videoElement,
}: ControlsProps) => {
  const [volumeOfVideo, setVolumeOfVideo] = useState(50);
  const [muted, setMuted] = useState(false);
  const fullScreenRef = useRef<HTMLButtonElement | null>(null);

  const isReplayButton = useMemo(() => {
    return (
      currentDurationOfVideo >= durationOfVideo && currentDurationOfVideo !== 0
    );
  }, [currentDurationOfVideo, durationOfVideo]);

  //handling screen orientation change event to make the video fullscreen
  const orientationChange = useCallback(() => {
    if (
      screen.orientation.type.includes('landscape') &&
      !document.fullscreenElement
    ) {
      handleToggleFullScreen(videoElement);
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }
  }, [videoElement]);

  // Listen for the window.orientationchange event
  useEffect(() => {
    window.addEventListener('orientationchange', orientationChange);
    return () => {
      window.removeEventListener('orientationchange', orientationChange);
    };
  }, [orientationChange]);

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

  //make video fullscreen on button click
  const handleToggleFullScreen = (
    element: DocumentElementWithFullscreen | null
  ) => {
    if (element) {
      if (element.requestFullscreen) {
        element
          .requestFullscreen({
            navigationUI: 'auto',
          })
          .catch(err => {
            console.log(
              `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
            );
          });
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen(); // For older versions of Firefox
        document.addEventListener('fullscreenerror', event => {
          console.log(`Error attempting to enable full-screen mode: ${event}`);
        });
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen(); // For older versions of Chrome, Safari and Opera
        document.addEventListener('fullscreenerror', event => {
          console.log(`Error attempting to enable full-screen mode: ${event}`);
        });
      } else if (element.webkitEnterFullscreen) {
        element.webkitEnterFullscreen(); //For iOS devices
        document.addEventListener('fullscreenerror', event => {
          console.log(`Error attempting to enable full-screen mode: ${event}`);
        });
      }
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
        <button
          onClick={() => handleToggleFullScreen(videoElement)}
          ref={fullScreenRef}
        >
          <MdFullscreen color='white' />
        </button>
      </div>
    </div>
  );
};

export default Controls;
