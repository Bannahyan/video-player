import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import Controls from './Controls';
import ForwardBackward from './ForwardBackwardLayer';
import PlayPause from './PlayPauseAnimation';
import styles from '../styles/home.module.css';

const VideoPlayer = () => {
  const [durationOfVideo, setDurationOfVideo] = useState(0);
  const [currentDurationOfVideo, setCurrentDurationOfVideo] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [fastForwardClicked, setFastForwardClicked] = useState(false);
  const [backwardClicked, setBackwardClicked] = useState(false);
  const [areaClicked, setAreaClicked] = useState(false);
  const [forwardClickedTime, setForwardClickedTime] = useState(0);
  const [backwardClickedTime, setBackwardClickedTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoElement = videoRef.current as HTMLVideoElement;

  //setting the duration of the video in order to be able to scrub the video
  useEffect(() => {
    if (videoRef.current) {
      setDurationOfVideo(videoRef.current.duration);
    }
  }, []);

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

  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setDurationOfVideo(videoRef.current.duration);
        getDurationOfVideo();
        setIsPaused(false);
      } else {
        videoRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  const videoReplay = () => {
    if (videoRef.current) {
      setDurationOfVideo(videoRef.current.duration);
      videoRef.current.currentTime = 0;
      getDurationOfVideo();
      videoRef.current.play();
    }
  };

  const getDurationOfVideo = () => {
    const videoIntervalTime = setInterval(() => {
      if (videoRef.current) {
        setCurrentDurationOfVideo(videoRef.current.currentTime);
        if (videoRef.current.currentTime >= durationOfVideo) {
          clearVideoInterval();
        }
      }
    }, 100);

    const clearVideoInterval = () => {
      clearInterval(videoIntervalTime);
    };
  };

  const videoDuration = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      setCurrentDurationOfVideo(parseFloat(e.target.value));
      videoRef.current.currentTime = parseFloat(e.target.value);
    }
  };

  const handleForwardBackward = (forward: boolean) => {
    const value = forward ? 10 : -10;
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

  const handleForwardBackwardMobile = (forward: boolean) => {
    let date = new Date();
    let time = date.getTime();
    const time_between_taps = 300;
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

  return (
    <div className={styles.videoContainer}>
      <video
        ref={videoRef}
        onClick={() => {
          setAreaClicked(true);
          handleTogglePlay();
        }}
      >
        <source type='video/mp4' src={'./assets/sunset.mp4'}></source>
      </video>
      <PlayPause
        areaClicked={areaClicked}
        setAreaClicked={setAreaClicked}
        handleTogglePlay={handleTogglePlay}
        isPaused={isPaused}
      />
      <ForwardBackward
        className={classNames(
          styles.fastForward,
          fastForwardClicked ? styles.visible : styles.hidden
        )}
        onDoubleClick={() => handleForwardBackward(true)}
        onTouchStart={() => handleForwardBackwardMobile(true)}
        forward
      />
      <ForwardBackward
        className={classNames(
          styles.fastBackward,
          backwardClicked ? styles.visible : styles.hidden
        )}
        onDoubleClick={() => handleForwardBackward(false)}
        onTouchStart={() => handleForwardBackwardMobile(false)}
        forward={false}
      />
      <Controls
        durationOfVideo={durationOfVideo}
        currentDurationOfVideo={currentDurationOfVideo}
        videoDuration={videoDuration}
        videoReplay={videoReplay}
        handleTogglePlay={handleTogglePlay}
        isPaused={isPaused}
        videoElement={videoElement}
      />
    </div>
  );
};

export default VideoPlayer;
