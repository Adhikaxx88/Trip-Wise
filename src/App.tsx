import { Navigate, Route, Routes } from 'react-router-dom';
import { CurrentTripProvider } from './context/CurrentTripContext';
import { SavedTripsProvider } from './context/SavedTripsContext';
import { TripPreferencesProvider } from './context/TripPreferencesContext';
import Chatbot from './pages/Chatbot';
import Edit from './pages/Edit';
import Landing from './pages/Landing';
import Questionnaire from './pages/Questionnaire';
import Saved from './pages/Saved';
import Summary from './pages/Summary';

function App() {
  return (
    <TripPreferencesProvider>
      <CurrentTripProvider>
        <SavedTripsProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/questionnaire" element={<Questionnaire />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/trip/:id" element={<Summary />} />
            <Route path="/trip/:id/edit" element={<Edit />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SavedTripsProvider>
      </CurrentTripProvider>
    </TripPreferencesProvider>
  );
}

export default App;
