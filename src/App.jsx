import { Box, Button } from '@chakra-ui/react';
import { generatePlanning } from './utils/generate-planning';

function App() {
  return (
    <Box>
      <Button onClick={() => generatePlanning({ class_id: 1, week: 3 })}>
        Test GENERATE PLANNING
      </Button>
    </Box>
  );
}

export default App;
