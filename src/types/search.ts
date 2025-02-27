// 강의 타입
export interface Lecture {
  id: string;
  title: string;
  grade: number;
  credits: string;
  major: string;
  schedule: string;
}

// 검색 옵션 타입
export interface SearchOption {
  query?: string;
  grades: number[];
  days: string[];
  times: number[];
  majors: string[];
  credits?: number;
}

// 시간표 스케줄 타입
export interface Schedule {
  day: string;
  range: number[];
  lecture: Lecture;
}

// 시간 슬롯 타입
export interface TimeSlot {
  id: number;
  label: string;
}

// 검색 정보 타입
export interface SearchInfo {
  tableId: string;
  day?: string;
  time?: number;
}

// 검색 필터 Props 타입
export interface SearchFilterProps {
  searchOptions: SearchOption;
  allMajors: string[];
  onChangeOption: (field: keyof SearchOption, value: any) => void;
}

// 검색 결과 Props 타입
export interface SearchResultsProps {
  lectures: Lecture[];
  onAddSchedule: (lecture: Lecture) => void;
}