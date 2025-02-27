import { useEffect, useRef, useCallback } from 'react';

interface UseIntersectionObserverProps {
  onIntersect: () => void;
  root?: Element | null;
  rootMargin?: string;
  threshold?: number;
  enabled?: boolean;
  hasNextPage?: boolean;
}

/**
 * IntersectionObserver 훅
 * @param onIntersect - observer가 탐지될 때 호출될 콜백 함수
 * @param root - observer의 루트 요소
 * @param rootMargin - 루트 요소의 마진
 * @param threshold - observer가 탐지될 때의 임계값
 * @param enabled - observer가 활성화되는지 여부
 * @param hasNextPage - 다음 페이지 존재 여부
 * @returns
 */
export const useIntersectionObserver = ({
  onIntersect,
  root = null,
  rootMargin = '100px',
  threshold = 0.1,
  enabled = true,
  hasNextPage = true,
}: UseIntersectionObserverProps) => {
  const targetRef = useRef<HTMLElement | null>(null);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && enabled && hasNextPage) {
        onIntersect();
      }
    },
    [onIntersect, enabled, hasNextPage],
  );

  useEffect(() => {
    const target = targetRef.current;
    if (!enabled || !hasNextPage || !target) return;

    const observer = new IntersectionObserver(handleIntersect, {
      root,
      rootMargin,
      threshold,
    });

    observer.observe(target);
    return () => observer.disconnect();
  }, [enabled, hasNextPage, root, rootMargin, threshold, handleIntersect]);

  return targetRef;
};
