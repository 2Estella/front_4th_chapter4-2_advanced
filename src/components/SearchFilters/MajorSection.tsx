import { memo } from 'react';
import {
  FormControl,
  FormLabel,
  Stack,
  Box,
  Checkbox,
  CheckboxGroup,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap
} from '@chakra-ui/react';

interface MajorSectionProps {
  selectedMajors: string[];
  allMajors: string[];
  onChange: (values: string[]) => void;
}

const MajorSection = memo(({ selectedMajors, allMajors, onChange }: MajorSectionProps) => {
  return (
    <FormControl>
      <FormLabel>전공</FormLabel>
      <CheckboxGroup
        colorScheme="green"
        value={selectedMajors}
        onChange={onChange}
      >
        <Wrap spacing={1} mb={2}>
          {selectedMajors.map((major) => (
            <Tag key={major} size="sm" variant="outline" colorScheme="blue">
              <TagLabel>{major.split('<p>').pop()}</TagLabel>
              <TagCloseButton
                onClick={() =>
                  onChange(selectedMajors.filter((v) => v !== major))
                }
              />
            </Tag>
          ))}
        </Wrap>
        <Stack
          spacing={2}
          overflowY="auto"
          h="100px"
          border="1px solid"
          borderColor="gray.200"
          borderRadius={5}
          p={2}
        >
          {allMajors.map((major) => (
            <Box key={major}>
              <Checkbox size="sm" value={major}>
                {major.replace(/<p>/gi, ' ')}
              </Checkbox>
            </Box>
          ))}
        </Stack>
      </CheckboxGroup>
    </FormControl>
  );
});

export default MajorSection;