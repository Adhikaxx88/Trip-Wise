import { Navigate, Route, Routes } from 'react-router-dom';
import { CurrentTripProvider } from './context/CurrentTripContext';
import { SavedTripsProvider } from './context/SavedTripsContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { TripPreferencesProvider } from './context/TripPreferencesContext';
import Chatbot from './pages/Chatbot';
import Edit from './pages/Edit';
import Landing from './pages/Landing';
import Profile from './pages/Profile';
import Questionnaire from './pages/Questionnaire';
import Saved from './pages/Saved';
import Summary from './pages/Summary';

function App() {
  return (
    <TripPreferencesProvider>
      <CurrentTripProvider>
        <SavedTripsProvider>
          <SubscriptionProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/questionnaire" element={<Questionnaire />} />
              <Route path="/chatbot" element={<Chatbot />} />
              <Route path="/trip/:id" element={<Summary />} />
              <Route path="/trip/:id/edit" element={<Edit />} />
              <Route path="/saved" element={<Saved />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </SubscriptionProvider>
        </SavedTripsProvider>
      </CurrentTripProvider>
    </TripPreferencesProvider>
  );
}

export default App;
