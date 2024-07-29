// pages/index.js
import React from 'react';
import { useRouter } from 'next/router';
import styles from '../components/Backbutton.module.css';

export default function Home() {

  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className={styles.container}>
      <button onClick={handleBack} className={styles.backButton}>
        Back
      </button>
      <div className={styles.textContainer}>
        <p>Hi! This is an instruction page on how to use this demo hehehe</p>
      </div>
    </div>
  );
}