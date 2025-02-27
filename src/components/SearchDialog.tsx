import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from '@chakra-ui/react';
import axios from 'axios';
import { useEffect, useRef, useState, useCallback, memo, LegacyRef } from 'react';

import SearchFilters from './SearchFilters';
import SearchResults from './SearchResults';
import useDebounce from '../hooks/useDebounce';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { parseSchedule } from '../utils';
import { useScheduleContext } from './Schedule/ScheduleContext';

import { Lecture, SearchOption } from '@/types';

interface Props {
  searchInfo: {
    tableId: string;
    day?: string;
    time?: number;
  } | null;
  onClose: () => void;
}

const PAGE_SIZE = 20;

// API 호출 함수
const fetchMajors = () => axios.get<Lecture[]>('/schedules-majors.json');
const fetchLiberalArts = () => axios.get<Lecture[]>('/schedules-liberal-arts.json');

/**
 * 검색 모달 컴포넌트
 */
const SearchDialog = memo(({ searchInfo, onClose }: Props) => {
  const { setSchedulesMap } = useScheduleContext();
  const workerRef = useRef<Worker | null>(null);

  // 상태 관리
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [page, setPage] = useState(1);
  const [searchQuery, _setSearchQuery] = useState('');
  const [searchOptions, setSearchOptions] = useState<SearchOption>({
    query: '',
    grades: [],
    days: [],
    times: [],
    majors: [],
  });
  const [_error, setError] = useState<Error | null>(null);
  const [_isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentItems, setCurrentItems] = useState<Lecture[]>([]);

  // 검색어 디바운스 처리
  const debouncedQuery = useDebounce(searchQuery, 300);

  // 페이지 상태 관리 개선
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadMore = useCallback(() => {
    if (isLoadingMore || currentItems.length >= totalCount) return;

    setIsLoadingMore(true);
    setPage((prev) => prev + 1);
  }, [isLoadingMore, currentItems.length, totalCount]);

  // 워커 초기화
  useEffect(() => {
    workerRef.current = new Worker(new URL('../workers/filter.worker.ts', import.meta.url), {
      type: 'module',
    });

    const handleMessage = (e: MessageEvent) => {
      const { items, total } = e.data;
      setCurrentItems(items);
      setTotalCount(total);
    };

    workerRef.current.addEventListener('message', handleMessage);

    return () => {
      workerRef.current?.removeEventListener('message', handleMessage);
      workerRef.current?.terminate();
    };
  }, []);

  // 워커 메시지 처리 개선
  useEffect(() => {
    if (!workerRef.current) return;

    const handleMessage = (e: MessageEvent) => {
      const { items, total } = e.data;
      setCurrentItems((prev) => [...prev, ...items]); // 기존 아이템 유지하면서 새 아이템 추가
      setTotalCount(total);
      setIsLoadingMore(false);
    };

    workerRef.current.addEventListener('message', handleMessage);
    return () => workerRef.current?.removeEventListener('message', handleMessage);
  }, []);

  const hasNextPage = currentItems.length < totalCount;

  // 무한 스크롤 처리를 위한 observer 설정
  const loaderRef = useIntersectionObserver({
    onIntersect: loadMore,
    enabled: !isLoadingMore,
    hasNextPage,
    rootMargin: '200px',
  });

  // 필터링 및 페이지네이션 처리
  useEffect(() => {
    if (!workerRef.current) return;

    // 검색 조건이 변경되면 페이지를 1로 리셋
    if (page === 1) {
      setCurrentItems([]); // 기존 결과 초기화
    }

    workerRef.current.postMessage({
      lectures,
      searchOptions,
      page,
      pageSize: PAGE_SIZE,
    });

    const handleMessage = (e: MessageEvent) => {
      const { items, total } = e.data;
      setCurrentItems((prev) => [...prev, ...items]); // 기존 결과에 새로운 결과 추가
      setTotalCount(total);
    };

    workerRef.current.addEventListener('message', handleMessage);
    return () => workerRef.current?.removeEventListener('message', handleMessage);
  }, [lectures, searchOptions, page]);

  // 전체 전공 목록
  const allMajors = [...new Set(lectures.map((lecture) => lecture.major))];

  // 검색 옵션 변경 핸들러
  const handleChangeOption = useCallback(
    <T extends keyof SearchOption>(field: T, value: SearchOption[T]) => {
      setPage(1); // 페이지 리셋
      setSearchOptions((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  // 디바운스된 검색어로 검색 옵션 업데이트
  useEffect(() => {
    handleChangeOption('query', debouncedQuery);
  }, [debouncedQuery, handleChangeOption]);

  // 강의 추가 핸들러
  const handleAddSchedule = useCallback(
    (lecture: Lecture) => {
      if (!searchInfo) return;
      const { tableId } = searchInfo;
      const schedules = parseSchedule(lecture.schedule).map((schedule) => ({
        ...schedule,
        lecture,
      }));
      setSchedulesMap((prev) => ({
        ...prev,
        [tableId]: [...prev[tableId], ...schedules],
      }));
      onClose();
    },
    [searchInfo, setSchedulesMap, onClose],
  );

  // 초기 강의 데이터 로딩 - 세션 스토리지 캐싱 활용
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const cachedData = sessionStorage.getItem('lectures');
        if (cachedData) {
          setLectures(JSON.parse(cachedData));
          return;
        }

        const [majors, liberalArts] = await Promise.all([fetchMajors(), fetchLiberalArts()]);

        const data = [...majors.data, ...liberalArts.data];
        sessionStorage.setItem('lectures', JSON.stringify(data));
        setLectures(data);
      } catch (error) {
        console.error('강의 데이터 로딩 실패:', error);
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // searchInfo 변경 시 필터 초기화
  useEffect(() => {
    setSearchOptions((prev) => ({
      ...prev,
      days: searchInfo?.day ? [searchInfo.day] : [],
      times: searchInfo?.time ? [searchInfo.time] : [],
    }));
    setPage(1);
  }, [searchInfo]);

  return (
    <Modal isOpen={Boolean(searchInfo)} onClose={onClose} size='6xl'>
      <ModalOverlay />
      <ModalContent maxW='90vw' w='1000px'>
        <ModalHeader>수업 검색</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align='stretch'>
            <SearchFilters
              searchOptions={searchOptions}
              allMajors={allMajors}
              onChangeOption={handleChangeOption}
            />
            <Text align='right'>검색결과: {totalCount}개</Text>
            <Box
              overflowY='auto'
              maxH='500px'
              css={{
                '&::-webkit-scrollbar': { width: '8px' },
                '&::-webkit-scrollbar-track': { background: '#f1f1f1' },
                '&::-webkit-scrollbar-thumb': {
                  background: '#888',
                  borderRadius: '4px',
                },
                scrollBehavior: 'smooth', // 스크롤 동작을 부드럽게
              }}
            >
              <SearchResults lectures={currentItems} onAddSchedule={handleAddSchedule} />
              {hasNextPage && <Box ref={loaderRef as LegacyRef<HTMLDivElement>} h='100px' />}
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});

export default SearchDialog;
