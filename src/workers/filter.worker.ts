import { Lecture } from '../types';
import { parseSchedule } from '../utils';

// 워커 스코프 타입 정의
declare const self: Worker;

// 검색어 필터링
const filterByQuery = (items: Lecture[], query: string) => {
  if (!query) return items;
  const loweredQuery = query.toLowerCase();
  return items.filter(
    (lecture) =>
      lecture.title.toLowerCase().includes(loweredQuery) ||
      lecture.id.toLowerCase().includes(loweredQuery),
  );
};

// 학년 필터링
const filterByGrades = (items: Lecture[], grades: number[]) => {
  if (grades.length === 0) return items;
  return items.filter((lecture) => grades.includes(lecture.grade));
};

// 전공 필터링
const filterByMajors = (items: Lecture[], majors: string[]) => {
  if (majors.length === 0) return items;
  return items.filter((lecture) => majors.includes(lecture.major));
};

// 학점 필터링
const filterByCredits = (items: Lecture[], credits: number) =>
  items.filter((lecture) => lecture.credits.startsWith(String(credits)));

// 요일 필터링
const filterByDays = (items: Lecture[], days: string[]) => {
  if (days.length === 0) return items;
  return items.filter((lecture) => {
    const schedules = lecture.schedule ? parseSchedule(lecture.schedule) : [];
    return schedules.some((s) => days.includes(s.day));
  });
};

// 시간 필터링
const filterByTimes = (items: Lecture[], times: number[]) => {
  if (times.length === 0) return items;
  return items.filter((lecture) => {
    const schedules = lecture.schedule ? parseSchedule(lecture.schedule) : [];
    return schedules.some((s) => s.range.some((time) => times.includes(time)));
  });
};

// 메시지 수신 및 필터링 처리
self.onmessage = (e: MessageEvent) => {
  const { lectures, searchOptions, page, pageSize } = e.data;
  let result = lectures;

  // 필터링 로직 적용 - 필터가 있는 경우에만 필터링 수행
  const { query = '', credits, grades = [], days = [], times = [], majors = [] } = searchOptions;

  if (query) {
    result = filterByQuery(result, query);
  }
  if (grades.length > 0) {
    result = filterByGrades(result, grades);
  }
  if (majors.length > 0) {
    result = filterByMajors(result, majors);
  }
  if (credits) {
    result = filterByCredits(result, credits);
  }
  if (days.length > 0) {
    result = filterByDays(result, days);
  }
  if (times.length > 0) {
    result = filterByTimes(result, times);
  }

  // 전체 결과 개수
  const total = result.length;

  // 페이지네이션 적용
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const items = result.slice(start, end);

  // 결과 전송
  self.postMessage({ items, total });
};
