import { AnimatePresence } from 'framer-motion';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import PageTransition from './components/PageTransition';
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

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
        <Route path="/questionnaire" element={<PageTransition><Questionnaire /></PageTransition>} />
        <Route path="/chatbot" element={<PageTransition><Chatbot /></PageTransition>} />
        <Route path="/trip/:id" element={<PageTransition><Summary /></PageTransition>} />
        <Route path="/trip/:id/edit" element={<PageTransition><Edit /></PageTransition>} />
        <Route path="/saved" element={<PageTransition><Saved /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <TripPreferencesProvider>
      <CurrentTripProvider>
        <SavedTripsProvider>
          <SubscriptionProvider>
            <AnimatedRoutes />
          </SubscriptionProvider>
        </SavedTripsProvider>
      </CurrentTripProvider>
    </TripPreferencesProvider>
  );
}

export default App;
