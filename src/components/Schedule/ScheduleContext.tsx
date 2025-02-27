import {
  createContext,
  PropsWithChildren,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';

import dummyScheduleMap from '../../mocks/data/dummyScheduleMap';
import { Schedule } from '../../types';

// 개별 시간표 컨텍스트
interface ScheduleContextType {
  scheduleIds: string[];
  schedulesMap: Record<string, Schedule[]>;
  setSchedulesMap: React.Dispatch<React.SetStateAction<Record<string, Schedule[]>>>;
  addSchedule: (id: string, schedules: Schedule[]) => void;
  removeSchedule: (id: string) => void;
  updateSchedule: (id: string, schedules: Schedule[]) => void;
  getSchedule: (id: string) => Schedule[];
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const ScheduleProvider = ({ children }: PropsWithChildren) => {
  const [schedules, setSchedules] = useState<Record<string, Schedule[]>>(dummyScheduleMap);
  const [scheduleIds, setScheduleIds] = useState<string[]>(Object.keys(dummyScheduleMap));

  // 메모이제이션된 핸들러들
  const addSchedule = useCallback((id: string, newSchedules: Schedule[]) => {
    setSchedules((prev) => ({
      ...prev,
      [id]: newSchedules,
    }));
    setScheduleIds((prev) => [...prev, id]);
  }, []);

  const removeSchedule = useCallback((id: string) => {
    setSchedules((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setScheduleIds((prev) => prev.filter((scheduleId) => scheduleId !== id));
  }, []);

  const updateSchedule = useCallback((id: string, newSchedules: Schedule[]) => {
    setSchedules((prev) => ({
      ...prev,
      [id]: newSchedules,
    }));
  }, []);

  const getSchedule = useCallback((id: string) => schedules[id] || [], [schedules]);

  // context value 메모이제이션
  const contextValue = useMemo(
    () => ({
      scheduleIds,
      schedulesMap: schedules,
      setSchedulesMap: setSchedules,
      addSchedule,
      removeSchedule,
      updateSchedule,
      getSchedule,
    }),
    [scheduleIds, schedules, addSchedule, removeSchedule, updateSchedule, getSchedule],
  );

  return <ScheduleContext.Provider value={contextValue}>{children}</ScheduleContext.Provider>;
};

// 커스텀 훅
export const useScheduleContext = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useScheduleContext must be used within a ScheduleProvider');
  }
  return context;
};
