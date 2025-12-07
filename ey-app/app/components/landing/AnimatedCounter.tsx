"use client";
import { useEffect, useState } from "react";

interface AnimatedCounterProps {
  value: string;
  className?: string;
}

export default function AnimatedCounter({ value, className }: AnimatedCounterProps) {

  const number = parseFloat(value);

  if (isNaN(number)) return <span className={className}>{value}</span>;

  const suffix = value.replace(/[0-9.]/g, "");

  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = number;

    const duration = 15000; // ms
    const fps = 60;
    const totalFrames = Math.round((duration / 100) * fps);
    const increment = (end - start) / totalFrames;

    let frame = 0;

    const interval = setInterval(() => {
      frame++;
      start += increment;
      setCount(start);

      if (frame >= totalFrames) {
        clearInterval(interval);
        setCount(end);
      }
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [number]);

  return (
    <span className={className}>
      {count.toFixed(number % 1 !== 0 ? 2 : 0)}
      {suffix}
    </span>
  );
}
