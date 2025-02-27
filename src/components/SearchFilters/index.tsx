import { VStack, HStack, FormControl, FormLabel, Input, Select, Box } from '@chakra-ui/react';
import { memo } from 'react';

import DaySection from './DaySection';
import GradeSection from './GradeSection';
import MajorSection from './MajorSection';
import TimeSection from './TimeSection';

import type { SearchFilterProps } from '@/types';

/**
 * 검색 필터 컴포넌트
 */
const SearchFilters = memo(({ searchOptions, allMajors, onChangeOption }: SearchFilterProps) => (
  <VStack spacing={4} align='stretch'>
    <HStack spacing={4}>
      <FormControl w='50%'>
        <FormLabel>검색어</FormLabel>
        <Input
          placeholder='과목명 또는 과목코드'
          value={searchOptions.query}
          onChange={(e) => onChangeOption('query', [e.target.value])}
        />
      </FormControl>

      <FormControl w='50%'>
        <FormLabel>학점</FormLabel>
        <Select
          value={searchOptions.credits}
          onChange={(e) => onChangeOption('credits', [e.target.value])}
        >
          <option value=''>전체</option>
          <option value='1'>1학점</option>
          <option value='2'>2학점</option>
          <option value='3'>3학점</option>
        </Select>
      </FormControl>
    </HStack>

    <HStack spacing={4}>
      <Box w='50%'>
        <GradeSection
          selectedGrades={searchOptions.grades}
          onChange={(values: number[]) => onChangeOption('grades', values)}
        />
      </Box>
      <Box w='50%'>
        <DaySection
          selectedDays={searchOptions.days}
          onChange={(values: string[]) => onChangeOption('days', values)}
        />
      </Box>
    </HStack>

    <HStack spacing={4}>
      <Box w='50%'>
        <TimeSection
          selectedTimes={searchOptions.times}
          onChange={(values: number[]) => onChangeOption('times', values)}
        />
      </Box>
      <Box w='50%'>
        <MajorSection
          selectedMajors={searchOptions.majors}
          allMajors={allMajors}
          onChange={(values) => onChangeOption('majors', values)}
        />
      </Box>
    </HStack>
  </VStack>
));

export default SearchFilters;
