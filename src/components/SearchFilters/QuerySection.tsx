import { memo } from 'react';
import { FormControl, FormLabel, Input, Select, HStack } from '@chakra-ui/react';

interface QuerySectionProps {
  query: string;
  credits?: number;
  onChangeQuery: (value: string) => void;
  onChangeCredits: (value: string) => void;
}

const QuerySection = memo(({ query, credits, onChangeQuery, onChangeCredits }: QuerySectionProps) => {
  return (
    <HStack spacing={4}>
      <FormControl>
        <FormLabel>검색어</FormLabel>
        <Input
          placeholder="과목명 또는 과목코드"
          value={query}
          onChange={(e) => onChangeQuery(e.target.value)}
        />
      </FormControl>

      <FormControl>
        <FormLabel>학점</FormLabel>
        <Select
          value={credits}
          onChange={(e) => onChangeCredits(e.target.value)}
        >
          <option value="">전체</option>
          <option value="1">1학점</option>
          <option value="2">2학점</option>
          <option value="3">3학점</option>
        </Select>
      </FormControl>
    </HStack>
  );
});

export default QuerySection;