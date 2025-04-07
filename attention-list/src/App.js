import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import EnergyTriangle from './pages/EnergyTriangle';
import ActivityRecord from './pages/ActivityRecord';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/energy-triangle" element={<EnergyTriangle />} />
          <Route path="/activity-record" element={<ActivityRecord />} />
          <Route path="/summary" element={<div>总结报告页面（待实现）</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
