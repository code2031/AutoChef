import React, { useState, useEffect } from 'react';

export default function ProgressBar({ active }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!active) {
      setTimeout(() => setProgress(100), 0);
      return;
    }
    setTimeout(() => setProgress(0), 0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) { clearInterval(interval); return 90; }
        return prev + (90 - prev) * 0.04;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <div className="w-full h-0.5 bg-transparent overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300 ease-out"
        style={{ width: `${active ? progress : progress === 100 ? 100 : 0}%`, opacity: active || progress < 100 ? 1 : 0 }}
      />
    </div>
  );
}
