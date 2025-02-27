import { Button, ButtonGroup, Flex, Heading, Stack, Box, Text, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverBody } from '@chakra-ui/react';
import { memo, useCallback, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

import { useScheduleContext } from './ScheduleContext';
import ScheduleTable from './ScheduleTable';
import SearchDialog from './SearchDialog';

// 개별 시간표 컴포넌트
const ScheduleTableItem = memo(({
  tableId,
  index,
  onDuplicate,
  onRemove,
  onSearch
}: {
  tableId: string;
  index: number;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
  onSearch: (info: { tableId: string; day?: string; time?: number }) => void;
}) => {
  const { getSchedule, updateSchedule } = useScheduleContext();
  const schedules = getSchedule(tableId);

  const handleDeleteSchedule = useCallback(({ day, time }: { day: string; time: number }) => {
    const newSchedules = schedules.filter(
      schedule => schedule.day !== day || !schedule.range.includes(time)
    );
    updateSchedule(tableId, newSchedules);
  }, [schedules, tableId, updateSchedule]);

  return (
    <Stack width='600px'>
      <Flex justifyContent='space-between' alignItems='center'>
        <Heading as='h3' fontSize='lg'>
          시간표 {index + 1}
        </Heading>
        <ButtonGroup size='sm' isAttached>
          <Button colorScheme='green' onClick={() => onSearch({ tableId })}>
            시간표 추가
          </Button>
          <Button colorScheme='green' mx='1px' onClick={() => onDuplicate(tableId)}>
            복제
          </Button>
          <Button colorScheme='green' onClick={() => onRemove(tableId)}>
            삭제
          </Button>
        </ButtonGroup>
      </Flex>
      <ScheduleTable
        schedules={schedules}
        tableId={tableId}
        onScheduleTimeClick={(timeInfo) => onSearch({ tableId, ...timeInfo })}
        onDeleteButtonClick={handleDeleteSchedule}
      />
    </Stack>
  );
});

export const ScheduleTables = memo(() => {
  const { scheduleIds, addSchedule, removeSchedule, getSchedule } = useScheduleContext();
  const [searchInfo, setSearchInfo] = useState<{
    tableId: string;
    day?: string;
    time?: number;
  } | null>(null);

  const handleDuplicate = useCallback((targetId: string) => {
    const newId = `schedule-${Date.now()}`;
    const schedulesToCopy = getSchedule(targetId);
    addSchedule(newId, [...schedulesToCopy]);
  }, [addSchedule, getSchedule]);

  const handleRemove = useCallback((targetId: string) => {
    if (scheduleIds.length > 1) {
      removeSchedule(targetId);
    }
  }, [scheduleIds.length, removeSchedule]);

  return (
    <>
      <Flex w='full' gap={6} p={6} flexWrap='wrap'>
        {scheduleIds.map((tableId, index) => (
          <ScheduleTableItem
            key={tableId}
            tableId={tableId}
            index={index}
            onDuplicate={handleDuplicate}
            onRemove={handleRemove}
            onSearch={setSearchInfo}
          />
        ))}
      </Flex>
      <SearchDialog searchInfo={searchInfo} onClose={() => setSearchInfo(null)} />
    </>
  );
});

// DraggableSchedule 컴포넌트 수정
const DraggableSchedule = memo(({
  id,
  data,
  bg,
  onDeleteButtonClick,
}: {
  id: string;
  data: Schedule;
} & ComponentProps<typeof Box> & {
  onDeleteButtonClick: () => void;
}) => {
  const { day, range, room, lecture } = data;
  const { attributes, setNodeRef, listeners, transform, isDragging } = useDraggable({ id });
  const leftIndex = DAY_LABELS.indexOf(day as (typeof DAY_LABELS)[number]);
  const topIndex = range[0] - 1;
  const size = range.length;

  return (
    <Popover>
      <PopoverTrigger>
        <Box
          position='absolute'
          left={`${120 + CellSize.WIDTH * leftIndex + 1}px`}
          top={`${40 + (topIndex * CellSize.HEIGHT + 1)}px`}
          width={CellSize.WIDTH - 1 + 'px'}
          height={CellSize.HEIGHT * size - 1 + 'px'}
          bg={bg}
          p={1}
          boxSizing='border-box'
          cursor='pointer'
          ref={setNodeRef}
          transform={CSS.Translate.toString(transform)}
          zIndex={isDragging ? 1000 : 1} // 드래그 중일 때 z-index 증가
          {...listeners}
          {...attributes}
        >
          <Text fontSize='sm' fontWeight='bold'>
            {lecture.title}
          </Text>
          <Text fontSize='xs'>{room}</Text>
        </Box>
      </PopoverTrigger>
      <PopoverContent onClick={(event) => event.stopPropagation()}>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody>
          <Text>강의를 삭제하시겠습니까?</Text>
          <Button colorScheme='red' size='xs' onClick={onDeleteButtonClick}>
            삭제
          </Button>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
});
