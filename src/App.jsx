import { generatePlanning } from './utils/generate-planning';

function App() {
  return (
    <>
      <h1>HACKATHON TEST</h1>
      <button onClick={() => generatePlanning({ class_id: 1, week: 3 })}>
        Test GENERATE PLANNING
      </button>
    </>
  );
}

export default App;
