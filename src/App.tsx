import { ChakraProvider } from '@chakra-ui/react';

import { ScheduleProvider } from './components/Schedule/ScheduleContext';
import ScheduleDndProvider from './components/Schedule/ScheduleDndProvider';
import { ScheduleTables } from './components/ScheduleTables';

function App() {
  return (
    <ChakraProvider>
      <ScheduleProvider>
        <ScheduleDndProvider>
          <ScheduleTables />
        </ScheduleDndProvider>
      </ScheduleProvider>
    </ChakraProvider>
  );
}

export default App;
