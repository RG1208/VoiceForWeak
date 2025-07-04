import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import VoiceAssistant from './pages/VoiceAssistant';
import SchemeRecommender from './pages/SchemeRecommender';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './components/protectedDashboard';
import PrivateRoute from './components/protectedRoutes';

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Single Layout for All Pages */}
        <Route path="/" element={<Layout />}>
          {/* Public Routes */}
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="contact" element={<Contact />} />

          {/* ✅ Protected Routes (Nested Inside PrivateRoute) */}
          <Route element={<PrivateRoute />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="voice-assistant" element={<VoiceAssistant />} />
            <Route path="scheme-recommender" element={<SchemeRecommender />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;