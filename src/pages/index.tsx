import VideoPlayer from '@/components/VideoPlayer';
import styles from '../styles/home.module.css';

export default function Home() {
  return (
    <main className={styles.container}>
      <div className={styles.box}>
        <VideoPlayer />
      </div>
    </main>
  );
}
