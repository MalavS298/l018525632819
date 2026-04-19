import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  /** The target numeric value to animate to */
  end: number;
  /** Duration of the animation in milliseconds */
  duration?: number;
  /** Suffix appended to the number (e.g. "+", "%") */
  suffix?: string;
  /** Prefix prepended to the number (e.g. "$") */
  prefix?: string;
  /** Decimal places to show */
  decimals?: number;
  /** Only start when scrolled into view (default true) */
  startOnView?: boolean;
  className?: string;
}

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

const CountUp = ({
  end,
  duration = 1600,
  suffix = "",
  prefix = "",
  decimals = 0,
  startOnView = true,
  className,
}: CountUpProps) => {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!ref.current) return;

    const start = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      const startTime = performance.now();
      const from = 0;
      const to = end;

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = easeOutQuart(t);
        setValue(from + (to - from) * eased);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (!startOnView) {
      start();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            start();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, startOnView]);

  // Re-trigger if `end` updates after the initial animation (e.g. data loads after mount)
  useEffect(() => {
    if (startedRef.current && end !== value) {
      const startTime = performance.now();
      const from = value;
      const to = end;
      const tick = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = easeOutQuart(t);
        setValue(from + (to - from) * eased);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [end]);

  const display = decimals > 0 ? value.toFixed(decimals) : Math.floor(value).toLocaleString();

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
};

export default CountUp;
