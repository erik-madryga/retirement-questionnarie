'use client';

import { useState } from 'react';
import styles from './page.module.css';
import Questionnaire, { type AnswerState } from '../components/Questionnaire';
import ReportView from '../components/ReportView';

export default function Home() {
  const [answers, setAnswers] = useState<AnswerState | null>(null);

  const handleComplete = (nextAnswers: AnswerState) => {
    setAnswers(nextAnswers);
  };

  const handleRestart = () => {
    setAnswers(null);
  };

  return (
    <div className={styles.page}>
      {answers ? (
        <ReportView answers={answers} onRestart={handleRestart} />
      ) : (
        <Questionnaire onComplete={handleComplete} />
      )}
    </div>
  );
}
