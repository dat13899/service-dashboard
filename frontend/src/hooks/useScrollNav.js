import { useState, useEffect } from 'react';

/**
 * Hook theo dõi scroll — trả về true khi scroll vượt ngưỡng.
 * Dùng để đổi navbar style (thêm shadow, blur mạnh hơn) khi user scroll.
 */
export default function useScrollNav(threshold = 60) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > threshold);
    handler(); // init
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [threshold]);

  return scrolled;
}
