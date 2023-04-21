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

const VideoPlayer = ({ src }: PlayerProps) => {
  const [durationOfVideo, setDurationOfVideo] = useState(0);
  const [currentDurationOfVideo, setCurrentDurationOfVideo] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [fastForwardClicked, setFastForwardClicked] = useState(false);
  const [backwardClicked, setBackwardClicked] = useState(false);
  const [areaClicked, setAreaClicked] = useState(false);
  const [forwardClickedTime, setForwardClickedTime] = useState(0);
  const [backwardClickedTime, setBackwardClickedTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  //setting the duration of the video in order to be able to scrub the video
  useEffect(() => {
    if (videoRef.current && !durationOfVideo) {
      setDurationOfVideo(videoRef.current.duration);
    }
  }, [durationOfVideo]);

  // const handleLoadedMetadata = useCallback(() => {
  //   // Access the duration property on the video element
  //   console.log('111');
  //   if (videoRef.current) {
  //     // alert(videoRef.current.duration);
  //     const duration = videoRef.current.duration;
  //     setDurationOfVideo(duration);
  //   }
  // }, []);

  // useEffect(() => {
  //   if (!videoRef.current) return;
  //   if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
  //     videoRef.current.src = src; // This will run in safari, where HLS is supported natively
  //   } else if (Hls.isSupported()) {
  //     // This will run in all other modern browsers
  //     const hls = new Hls();
  //     hls.loadSource(src);
  //     hls.attachMedia(videoRef.current);
  //   } else {
  //     console.error(
  //       'This is an old browser that does not support MSE https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API'
  //     );
  //   }

  //   // Add loadedmetadata event listener
  //   videoRef.current.addEventListener('canplay', handleLoadedMetadata);
  //   videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);

  //   // Cleanup function to remove event listener on unmount or when src changes
  //   return () => {
  //     if (videoRef.current) {
  //       videoRef.current.removeEventListener(
  //         'loadedmetadata',
  //         handleLoadedMetadata
  //       );
  //       videoRef.current.removeEventListener('canplay', handleLoadedMetadata);
  //     }
  //   };
  // }, [handleLoadedMetadata, src]);

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
    if (
      screen.orientation.type.includes('landscape') &&
      !document.fullscreenElement
    ) {
      handleToggleFullScreen(videoRef.current);
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }
  }, []);

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
      setIsPaused(videoRef.current.paused);
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
      // getDurationOfVideo();
    }
  };
  //changing scrubber value every 0.1 second
  const getDurationOfVideo = () => {
    const videoIntervalTime = setInterval(() => {
      if (videoRef.current) {
        setCurrentDurationOfVideo(videoRef.current.currentTime);
        if (
          videoRef.current.currentTime >= durationOfVideo ||
          videoRef.current.paused
        ) {
          clearVideoInterval();
        }
      }
    }, 100);

    const clearVideoInterval = () => {
      clearInterval(videoIntervalTime);
    };
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

  const onCanPlay = () => {
    if (videoRef.current && !durationOfVideo) {
      setDurationOfVideo(videoRef.current?.duration);
    }
  };

  return (
    <div className={styles.videoContainer}>
      <video
        ref={videoRef}
        onClick={() => {
          setAreaClicked(true);
          handleTogglePlay();
        }}
        playsInline
        webkit-playsinline='true'
        onLoadedMetadata={onCanPlay}
        onTimeUpdate={() =>
          videoRef.current &&
          setCurrentDurationOfVideo(videoRef.current?.currentTime)
        }
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
        handleToggleFullScreen={handleToggleFullScreen}
      />
    </div>
  );
};

export default VideoPlayer;
