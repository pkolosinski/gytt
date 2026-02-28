import { useEffect, useState } from 'react';

export function useProgress(value: number): { progress: number } {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(normalizeValue(value)), 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { progress };
}

const normalizeValue = (val: number) => {
  if (val < 0) return 0;
  return Math.min(val, 100);
};
