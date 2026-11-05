import { useLayoutEffect, useState, type RefObject } from 'react';

export interface Size {
  width: number;
  height: number;
}

/** Måler et elements indholdsstørrelse med ResizeObserver (heltal i CSS-px). */
export function useElementSize(ref: RefObject<HTMLElement | null>): Size {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      const width = Math.floor(r.width);
      const height = Math.floor(r.height);
      setSize((s) => (s.width === width && s.height === height ? s : { width, height }));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

/** devicePixelRatio, opdateres når vinduet flyttes mellem skærme / zoom ændres. */
export function useDevicePixelRatio(): number {
  const [dpr, setDpr] = useState(() => (typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1));
  useLayoutEffect(() => {
    let mq: MediaQueryList | null = null;
    const listen = () => {
      mq?.removeEventListener('change', onChange);
      mq = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      mq.addEventListener('change', onChange);
    };
    const onChange = () => {
      setDpr(window.devicePixelRatio || 1);
      listen();
    };
    listen();
    return () => mq?.removeEventListener('change', onChange);
  }, []);
  return dpr;
}
