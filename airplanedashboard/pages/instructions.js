// pages/instructions.js
import React from 'react';
import { useRouter } from 'next/router';
import InstructionsLayout from '../components/InstructionsLayout';
import styles from '../components/Instructions.module.css';

export default function Instructions() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className={styles.generalContainer}>
      <InstructionsLayout>
      </InstructionsLayout>
    </div>
  );
}
