import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import Controls from './ControlsPanel';
import ForwardBackward from './ForwardBackwardLayer';
import PlayPause from './PlayPauseAnimation';
import styles from './styles.module.css';

interface PlayerProps {
  src: string;
}

interface DocumentElementWithFullscreen extends HTMLElement {
  msRequestFullscreen?: () => void;
  mozRequestFullScreen?: () => void;
  webkitRequestFullscreen?: () => void;
  webkitEnterFullscreen?: () => void;
}

interface DocumentElementWithoutFullScreen extends HTMLVideoElement {
  webkitExitFullScreen?: () => void;
}

interface DocumentWithFullscreen extends HTMLDocument {
  msExitFullscreen?: () => void;
  mozCancelFullScreen?: () => void;
  webkitExitFullscreen?: () => void;
  webkitFullscreenElement?: Element;
  mozFullScreenElement?: Element;
  msFullscreenElement?: Element;
}

const VideoPlayer = ({ src }: PlayerProps) => {
  const [durationOfVideo, setDurationOfVideo] = useState(0);
  const [currentDurationOfVideo, setCurrentDurationOfVideo] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [fastForwardClicked, setFastForwardClicked] = useState(false);
  const [backwardClicked, setBackwardClicked] = useState(false);
  const [areaClicked, setAreaClicked] = useState(false);
  const [forwardClickedTime, setForwardClickedTime] = useState(0);
  const [backwardClickedTime, setBackwardClickedTime] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (videoRef.current && !durationOfVideo) {
      setDurationOfVideo(videoRef.current.duration);
    }
  }, [durationOfVideo]);

  //handling fast forward/backward animation
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;
    if (fastForwardClicked) {
      timeoutId = setTimeout(() => {
        setFastForwardClicked(false);
      }, 500);
    }
    if (backwardClicked) {
      timeoutId = setTimeout(() => {
        setBackwardClicked(false);
      }, 500);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [fastForwardClicked, backwardClicked]);

  //handling play/pause centered icon animation
  useEffect(() => {
    let areaId: NodeJS.Timeout | undefined;
    if (areaClicked) {
      areaId = setTimeout(() => {
        setAreaClicked(false);
      }, 300);
    }
    return () => {
      clearTimeout(areaId);
    };
  }, [areaClicked]);

  //handling screen orientation change event to make the video fullscreen
  const orientationChange = useCallback(() => {
    if (window.orientation === 0 || window.orientation === 180) {
      handleExitFullScreen(document, videoRef.current);
    } else if (window.orientation === 90 || window.orientation === -90) {
      handleToggleFullScreen(containerRef.current, videoRef.current);
    }
  }, []);

  const handleExitFullScreen = (
    doc: DocumentWithFullscreen,
    element: DocumentElementWithoutFullScreen | null
  ) => {
    if (doc.webkitExitFullscreen) {
      doc.webkitExitFullscreen();
    } else if (doc.msExitFullscreen) {
      doc.msExitFullscreen();
    } else if (doc.mozCancelFullScreen) {
      doc.mozCancelFullScreen();
    } else if (doc.exitFullscreen) {
      doc.exitFullscreen();
    } else if (element && element.webkitExitFullScreen) {
      element.webkitExitFullScreen();
    }
    setIsFullScreen(false);
  };

  // Listen for the window.orientationchange event
  useEffect(() => {
    window.addEventListener('orientationchange', orientationChange);
    return () => {
      window.removeEventListener('orientationchange', orientationChange);
    };
  }, [orientationChange]);

  //Change play/pause icons on exit full screen for iOS devices
  const handlePausePlayOnExit = useCallback(() => {
    if (videoRef.current) {
      setIsPaused(true);
    }
  }, []);

  useEffect(() => {
    videoRef.current &&
      videoRef.current.addEventListener(
        'webkitendfullscreen',
        handlePausePlayOnExit
      );
    return () => {
      videoRef.current &&
        videoRef.current.removeEventListener(
          'webkitendfullscreen',
          handlePausePlayOnExit
        );
    };
  }, [handlePausePlayOnExit]);

  //handling play, pause and replay events
  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPaused(false);
      } else {
        videoRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  //changing scrubber value every 0.1 second
  const handleTimeUpdate = () => {
    videoRef.current &&
      setCurrentDurationOfVideo(videoRef.current?.currentTime);
  };

  //change current duration of the video during scrubbing
  const videoDuration = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      setCurrentDurationOfVideo(parseFloat(e.target.value));
      videoRef.current.currentTime = parseFloat(e.target.value);
    }
  };

  //function for handling the forward and backward click
  const handleForwardBackward = (forward: boolean) => {
    const value = forward ? 10 : -10; //10 seconds forward or backward
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      videoRef.current.currentTime = current + value;
      setCurrentDurationOfVideo(current + value);
    }
    if (forward) {
      setFastForwardClicked(true);
    } else {
      setBackwardClicked(true);
    }
  };

  //function for handling double tapping on mobile
  const handleForwardBackwardMobile = (forward: boolean) => {
    let date = new Date();
    let time = date.getTime();
    const time_between_taps = 300; //time between two taps should be not more than 300ms
    const clickedTime = forward ? forwardClickedTime : backwardClickedTime;
    if (time - clickedTime <= time_between_taps) {
      handleForwardBackward(forward);
    }
    if (forward) {
      setForwardClickedTime(time);
    } else {
      setBackwardClickedTime(time);
    }
  };

  //make video fullscreen on button click
  const handleToggleFullScreen = (
    element: DocumentElementWithFullscreen | null,
    videoElement: DocumentElementWithFullscreen | null
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
      }
      if (videoElement?.webkitEnterFullscreen) {
        videoElement.webkitEnterFullscreen(); //For iOS devices
        videoElement.addEventListener('fullscreenerror', event => {
          console.log(`Error attempting to enable full-screen mode: ${event}`);
        });
      }
      setIsFullScreen(true);
    }
  };

  const onLoadedMetadata = () => {
    if (videoRef.current && !durationOfVideo) {
      setDurationOfVideo(videoRef.current?.duration);
    }
  };

  return (
    <div className={styles.videoContainer} ref={containerRef}>
      <video
        ref={videoRef}
        onClick={() => {
          setAreaClicked(true);
          handleTogglePlay();
        }}
        playsInline
        webkit-playsinline='true'
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
      >
        <source src='./assets/sunset.mp4'></source>
      </video>
      <div style={{ color: 'green' }}>{durationOfVideo} dur</div>
      <div style={{ color: 'green' }}>{currentDurationOfVideo} curdur</div>
      <PlayPause
        areaClicked={areaClicked}
        setAreaClicked={setAreaClicked}
        handleTogglePlay={handleTogglePlay}
        isPaused={isPaused}
      />
      <ForwardBackward
        clicked={fastForwardClicked}
        onDoubleClick={() => {
          handleForwardBackward(true);
        }}
        onTouchStart={() => {
          handleForwardBackwardMobile(true);
        }}
        forward
      />
      <ForwardBackward
        clicked={backwardClicked}
        onDoubleClick={() => handleForwardBackward(false)}
        onTouchStart={() => handleForwardBackwardMobile(false)}
        forward={false}
      />
      <Controls
        durationOfVideo={durationOfVideo}
        currentDurationOfVideo={currentDurationOfVideo}
        videoDuration={videoDuration}
        handleTogglePlay={handleTogglePlay}
        isPaused={isPaused}
        videoElement={videoRef.current}
        handleToggleFullScreen={() =>
          isFullScreen
            ? handleExitFullScreen(document, videoRef.current)
            : handleToggleFullScreen(containerRef.current, videoRef.current)
        }
        isFullScreen={isFullScreen}
      />
    </div>
  );
};

export default VideoPlayer;
