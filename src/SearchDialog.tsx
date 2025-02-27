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
import { useEffect, useRef, useState, useMemo, useCallback, memo } from 'react';

import SearchFilters from './components/SearchFilters';
import SearchResults from './components/SearchResults';
import useDebounce from './hooks/useDebounce';
import { useScheduleContext } from './ScheduleContext';
import { parseSchedule } from './utils';

import { Lecture, SearchOption } from '@/types';

interface Props {
  searchInfo: {
    tableId: string;
    day?: string;
    time?: number;
  } | null;
  onClose: () => void;
}

const PAGE_SIZE = 100;

// API 호출 함수
const fetchMajors = () => axios.get<Lecture[]>('/schedules-majors.json');

// 문학 학점 호출 함수
const fetchLiberalArts = () => axios.get<Lecture[]>('/schedules-liberal-arts.json');


/**
 * 검색 모달 컴포넌트
 */
const SearchDialog = memo(({ searchInfo, onClose }: Props) => {
  const { setSchedulesMap } = useScheduleContext();

  // 무한 스크롤을 위한 refs
  const loaderWrapperRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  // 상태 관리
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOptions, setSearchOptions] = useState<SearchOption>({
    query: '',
    grades: [],
    days: [],
    times: [],
    majors: [],
  });

  // 검색어 디바운스 처리
  const debouncedQuery = useDebounce(searchQuery, 300);

  // 검색어 필터링
  const filterByQuery = useCallback((items: Lecture[], query: string) => {
    if (!query) return items;
    const loweredQuery = query.toLowerCase();
    return items.filter(
      (lecture) =>
        lecture.title.toLowerCase().includes(loweredQuery) ||
        lecture.id.toLowerCase().includes(loweredQuery),
    );
  }, []);

  // 학점 필터링
  const filterByGrades = useCallback((items: Lecture[], grades: number[]) => {
    if (grades.length === 0) return items;
    return items.filter((lecture) => grades.includes(lecture.grade));
  }, []);

  // 전공 필터링
  const filterByMajors = useCallback((items: Lecture[], majors: string[]) => {
    if (majors.length === 0) return items;
    return items.filter((lecture) => majors.includes(lecture.major));
  }, []);

  // 학점 필터링
  const filterByCredits = useCallback(
    (items: Lecture[], credits: number) =>
      items.filter((lecture) => lecture.credits.startsWith(String(credits))),
    [],
  );

  // 요일 필터링
  const filterByDays = useCallback(
    (items: Lecture[], days: string[]) =>
      items.filter((lecture) => {
        const schedules = lecture.schedule ? parseSchedule(lecture.schedule) : [];
        return schedules.some((s) => days.includes(s.day));
      }),
    [],
  );

  // 시간 필터링
  const filterByTimes = useCallback(
    (items: Lecture[], times: number[]) =>
      items.filter((lecture) => {
        const schedules = lecture.schedule ? parseSchedule(lecture.schedule) : [];
        return schedules.some((s) => s.range.some((time) => times.includes(time)));
      }),
    [],
  );

  // 필터링된 강의 목록 - 검색 조건이 변경될 때만 재계산
  const filteredLectures = useMemo(() => {
    let result = lectures;
    const { query = '', credits, grades, days, times, majors } = searchOptions;

    result = filterByQuery(result, query);
    result = filterByGrades(result, grades);
    result = filterByMajors(result, majors);
    if (credits) result = filterByCredits(result, credits);
    if (days.length) result = filterByDays(result, days);
    if (times.length) result = filterByTimes(result, times);

    return result;
  }, [
    lectures,
    searchOptions,
    filterByQuery,
    filterByGrades,
    filterByMajors,
    filterByCredits,
    filterByDays,
    filterByTimes,
  ]);

  const lastPage = Math.ceil(filteredLectures.length / PAGE_SIZE);

  // 현재 페이지에 보여질 강의 목록
  const visibleLectures = useMemo(
    () => filteredLectures.slice(0, page * PAGE_SIZE),
    [filteredLectures, page],
  );

  // 전체 전공 목록
  const allMajors = useMemo(
    () => [...new Set(lectures.map((lecture) => lecture.major))],
    [lectures],
  );
  // 검색 옵션 변경 핸들러
  const handleChangeOption = useCallback(
    <T extends keyof SearchOption>(field: T, value: SearchOption[T]) => {
      setPage(1); // 옵션 변경 시 첫 페이지로 리셋
      setSearchOptions((prev: SearchOption) => ({ ...prev, [field]: value }));
      loaderWrapperRef.current?.scrollTo(0, 0);
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
      const cachedData = sessionStorage.getItem('lectures');
      if (cachedData) {
        setLectures(JSON.parse(cachedData));
        return;
      }

      const [majors, liberalArts] = await Promise.all([fetchMajors(), fetchLiberalArts()]);

      const data = [...majors.data, ...liberalArts.data];
      sessionStorage.setItem('lectures', JSON.stringify(data));
      setLectures(data);
    };

    fetchData();
  }, []);

  // 무한 스크롤 설정
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        if (entries[0].isIntersecting && page < lastPage) {
          setPage((prev: number) => prev + 1);
        }
      },
      { threshold: 0.1, root: loaderWrapperRef.current },
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [page, lastPage]);

  // searchInfo 변경 시 필터 초기화
  useEffect(() => {
    setSearchOptions((prev: SearchOption) => ({
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
            <Text align='right'>검색결과: {filteredLectures.length}개</Text>
            <Box ref={loaderWrapperRef} overflowY='auto' maxH='500px'>
              <SearchResults lectures={visibleLectures} onAddSchedule={handleAddSchedule} />
              <Box ref={loaderRef} h='20px' />
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});

export default SearchDialog;
