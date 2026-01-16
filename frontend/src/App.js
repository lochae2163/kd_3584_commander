import React, { useState } from 'react';
import './App.css';
import Calculator from './components/Calculator';
import Leaderboard from './components/Leaderboard';
import Header from './components/Header';

function App() {
  const [activeTab, setActiveTab] = useState('calculator');

  return (
    <div className="App">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="container">
        {activeTab === 'calculator' && <Calculator />}
        {activeTab === 'leaderboard' && <Leaderboard />}
      </main>

      <footer className="footer">
        <p>ROK Commander Calculator - Based on [TKC] Rally/Garrison Leaders Calculator by Davor</p>
        <p>Data extracted from Excel spreadsheet - All credit to original creators</p>
      </footer>
    </div>
  );
}

export default App;
