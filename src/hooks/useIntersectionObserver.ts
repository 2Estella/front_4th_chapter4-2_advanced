import { useEffect, useRef } from 'react';

interface UseIntersectionObserverProps {
  onIntersect: () => void;
  root?: Element | null;
  rootMargin?: string;
  threshold?: number;
  enabled?: boolean;
}

/**
 * IntersectionObserver 훅
 * @param onIntersect - observer가 탐지될 때 호출될 콜백 함수
 * @param root - observer의 루트 요소
 * @param rootMargin - 루트 요소의 마진
 * @param threshold - observer가 탐지될 때의 임계값
 * @param enabled - observer가 활성화되는지 여부
 * @returns
 */
export const useIntersectionObserver = ({
  onIntersect,
  root = null,
  rootMargin = '0px',
  threshold = 0,
  enabled = true,
}: UseIntersectionObserverProps) => {
  const targetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onIntersect();
        }
      },
      {
        root,
        rootMargin,
        threshold,
      }
    );

    const currentTarget = targetRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [enabled, root, rootMargin, threshold, onIntersect]);

  return targetRef;
};