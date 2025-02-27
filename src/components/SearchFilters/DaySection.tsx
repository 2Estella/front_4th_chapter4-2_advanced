import { memo } from 'react';
import { FormControl, FormLabel, HStack, Checkbox, CheckboxGroup } from '@chakra-ui/react';
import { DAY_LABELS } from '../../constants';

interface DaySectionProps {
  selectedDays: string[];
  onChange: (values: string[]) => void;
}

const DaySection = memo(({ selectedDays, onChange }: DaySectionProps) => {
  return (
    <FormControl>
      <FormLabel>요일</FormLabel>
      <CheckboxGroup
        value={selectedDays}
        onChange={onChange}
      >
        <HStack spacing={4}>
          {DAY_LABELS.map((day) => (
            <Checkbox key={day} value={day}>
              {day}
            </Checkbox>
          ))}
        </HStack>
      </CheckboxGroup>
    </FormControl>
  );
});

export default DaySection;