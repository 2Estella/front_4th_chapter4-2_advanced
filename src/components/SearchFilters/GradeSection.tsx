import { FormControl, FormLabel, HStack, Checkbox, CheckboxGroup } from '@chakra-ui/react';
import { memo } from 'react';

interface GradeSectionProps {
  selectedGrades: number[];
  onChange: (values: number[]) => void;
}

/**
 * 학년 선택 섹션
 */
const GradeSection = memo(({ selectedGrades, onChange }: GradeSectionProps) => (
  <FormControl>
    <FormLabel>학년</FormLabel>
    <CheckboxGroup value={selectedGrades} onChange={(values) => onChange(values.map(Number))}>
      <HStack spacing={4}>
        {[1, 2, 3, 4].map((grade) => (
          <Checkbox key={grade} value={grade}>
            {grade}학년
          </Checkbox>
        ))}
      </HStack>
    </CheckboxGroup>
  </FormControl>
));

export default GradeSection;
