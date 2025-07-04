import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import VoiceAssistant from './pages/VoiceAssistant';
import SchemeRecommender from './pages/SchemeRecommender';
import Contact from './pages/Contact';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/voice-assistant" element={<VoiceAssistant />} />
          <Route path="/scheme-recommender" element={<SchemeRecommender />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;