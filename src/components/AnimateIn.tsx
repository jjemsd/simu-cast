import { useEffect, useRef, useState } from 'react';

interface AnimateInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
}

/**
 * Wraps children and fades them up into view when they enter the viewport.
 * Uses IntersectionObserver — no library required.
 */
export function AnimateIn({ children, className = '', delay = 0, style }: AnimateInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const timer = setTimeout(() => setVisible(true), delay);
          observer.unobserve(el);
          // cleanup timer if component unmounts before delay fires
          return () => clearTimeout(timer);
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`animate-in${visible ? ' visible' : ''}${className ? ` ${className}` : ''}`}
      style={style}
    >
      {children}
    </div>
  );
}