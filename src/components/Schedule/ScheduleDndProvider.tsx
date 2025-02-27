import {
  DndContext,
  Modifier,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { PropsWithChildren, useCallback, useMemo, memo } from 'react';

import { useScheduleContext } from './ScheduleContext';
import { CellSize, DAY_LABELS } from '../../constants';

// 스냅 모디파이어를 상수로 분리
const snapModifier: Modifier = ({ transform, containerNodeRect, draggingNodeRect }) => {
  const containerTop = containerNodeRect?.top ?? 0;
  const containerLeft = containerNodeRect?.left ?? 0;
  const containerBottom = containerNodeRect?.bottom ?? 0;
  const containerRight = containerNodeRect?.right ?? 0;

  const { top = 0, left = 0, bottom = 0, right = 0 } = draggingNodeRect ?? {};

  const minX = containerLeft - left + 120 + 1;
  const minY = containerTop - top + 40 + 1;
  const maxX = containerRight - right;
  const maxY = containerBottom - bottom;

  return {
    ...transform,
    x: Math.min(Math.max(Math.round(transform.x / CellSize.WIDTH) * CellSize.WIDTH, minX), maxX),
    y: Math.min(Math.max(Math.round(transform.y / CellSize.HEIGHT) * CellSize.HEIGHT, minY), maxY),
  };
};

const modifiers = [snapModifier];

// DndContext의 children을 메모화
const DndChildren = memo(({ children }: PropsWithChildren) => <>{children}</>);

const ScheduleDndProvider = memo(({ children }: PropsWithChildren) => {
  const { schedulesMap, setSchedulesMap } = useScheduleContext();

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  });

  const sensors = useSensors(pointerSensor);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, delta } = event;
      if (!active) return;

      const { x, y } = delta;
      const [tableId, index] = String(active.id).split(':');
      const schedule = schedulesMap[tableId]?.[Number(index)];

      if (!schedule) return;

      const nowDayIndex = DAY_LABELS.indexOf(schedule.day as (typeof DAY_LABELS)[number]);
      const moveDayIndex = Math.floor(x / CellSize.WIDTH);
      const moveTimeIndex = Math.floor(y / CellSize.HEIGHT);

      const newDayIndex = nowDayIndex + moveDayIndex;
      if (newDayIndex < 0 || newDayIndex >= DAY_LABELS.length) return;

      setSchedulesMap((prev) => ({
        ...prev,
        [tableId]: prev[tableId].map((targetSchedule, targetIndex) => {
          if (targetIndex !== Number(index)) return targetSchedule;

          return {
            ...targetSchedule,
            day: DAY_LABELS[newDayIndex],
            range: targetSchedule.range.map((time) => time + moveTimeIndex),
          };
        }),
      }));
    },
    [schedulesMap, setSchedulesMap],
  );

  const dndContextProps = useMemo(
    () => ({
      sensors,
      onDragEnd: handleDragEnd,
      modifiers,
    }),
    [sensors, handleDragEnd],
  );

  return (
    <DndContext {...dndContextProps}>
      <DndChildren>{children}</DndChildren>
    </DndContext>
  );
});

ScheduleDndProvider.displayName = 'ScheduleDndProvider';

export default ScheduleDndProvider;
