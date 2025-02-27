import { useEffect, useState } from 'react';

/**
 * 입력값에 대한 디바운스 처리를 하는 커스텀 훅
 * @param value 디바운스 처리할 값
 * @param delay 디바운스 지연 시간 (ms)
 * @returns 디바운스된 값
 */
function useDebounce<T>(value: T, delay: number): T {
  // 디바운스된 값을 저장할 상태
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // delay 시간 후에 값을 업데이트하는 타이머 설정
    const timer = setTimeout(() => {
      // 값이 변경되었을 경우에만 업데이트
      if (debouncedValue !== value) {
        setDebouncedValue(value);
      }
    }, delay);

    // 새로운 값이 들어오면 이전 타이머를 클리어
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
