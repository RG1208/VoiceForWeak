import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import ProtectedLayout from './components/ProtectedLayout';
import PublicLayout from './components/PublicLayout';
import Home from './pages/Home';
import IPCSections from './pages/VoiceAssistant';
import SchemeRecommender from './pages/SchemeRecommender';
import BSNSections from './pages/bns';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './components/protectedDashboard';
import PrivateRoute from './components/protectedRoutes';

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Public Layout Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        {/* ✅ Protected Layout Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<ProtectedLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="ipc-assistant" element={<IPCSections />} />
            <Route path="bns-assistant" element={<BSNSections />} />
            <Route path="scheme-recommender" element={<SchemeRecommender />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
