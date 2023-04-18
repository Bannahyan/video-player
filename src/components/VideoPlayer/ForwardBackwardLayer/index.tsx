import React from 'react';
import { Inter } from 'next/font/google';
import classNames from 'classnames';
import { MdFastForward, MdFastRewind } from 'react-icons/md';
import styles from './styles.module.css';

const inter = Inter({ subsets: ['latin'] });

interface ForwardBackwardProps {
  onDoubleClick: React.MouseEventHandler<HTMLDivElement>;
  onTouchStart: React.TouchEventHandler<HTMLDivElement>;
  forward: boolean;
  clicked: boolean;
}

const ForwardBackward = ({
  onDoubleClick,
  onTouchStart,
  forward,
  clicked,
}: ForwardBackwardProps) => {
  return (
    <div
      className={classNames(
        forward ? styles.fastForward : styles.fastBackward,
        clicked ? styles.visible : styles.hidden
      )}
      onDoubleClick={onDoubleClick}
      onTouchStart={onTouchStart}
    >
      {!forward && <MdFastRewind color='white' size={24} />}
      <p
        className={classNames(
          inter.className,
          styles.text,
          forward ? 'mr-1' : 'ml-1'
        )}
      >
        10 sec.
      </p>
      {forward && <MdFastForward color='white' size={24} />}
    </div>
  );
};

export default ForwardBackward;
