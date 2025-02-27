import { Button, ButtonGroup, Flex, Heading, Stack } from '@chakra-ui/react';
import { memo, useCallback, useState } from 'react';

import { useScheduleContext } from './Schedule/ScheduleContext';
import ScheduleTable from './Schedule/ScheduleTable';
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
