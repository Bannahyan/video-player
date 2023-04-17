import VideoPlayer from '@/components/VideoPlayer';
import styles from '../styles/home.module.css';

export default function Home() {
  return (
    <main className={styles.container}>
      <div className={styles.box}>
        <VideoPlayer src='https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' />
      </div>
    </main>
  );
}
