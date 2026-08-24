import type { FlipClockThemeOptions } from 'flipclock';
import { clock, css, flipClock, theme } from 'flipclock';
import { useEffect, useRef } from 'react';

function FlipClock(options: FlipClockThemeOptions) {
  const clockRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const instance = flipClock({
      parent: clockRef.current,
      face: clock({ format: '[HH]:[mm]:[ss][A]' }),
      theme: theme({
        dividers: ':',
        css: css({
          fontSize: '2rem',
        }),

        ...options,
      }),
    });

    return () => {
      instance.unmount();
    };
  }, [options]);

  return <section ref={clockRef} />;
}

export default FlipClock;
