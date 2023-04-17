import styles from '../styles/home.module.css';
import VideoPlayer from '@/components/VideoPlayer';

export default function Home() {
  return (
    <main className={styles.container}>
      <div className={styles.box}>
        <VideoPlayer />
      </div>
    </main>
  );
}
