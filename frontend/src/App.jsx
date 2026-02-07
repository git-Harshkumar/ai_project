import { useState } from 'react';
import Dashboard from './components/Dashboard';
import FileUpload from './components/FileUpload';
import PredictionForm from './components/PredictionForm';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('predict');

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>Loan Prediction System</h1>
          <p>AI-Powered Loan Approval Prediction using Machine Learning</p>
        </header>

        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'predict' ? 'active' : ''}`}
            onClick={() => setActiveTab('predict')}
          >
            Single Prediction
          </button>
          <button
            className={`tab-button ${activeTab === 'batch' ? 'active' : ''}`}
            onClick={() => setActiveTab('batch')}
          >
            Batch Prediction
          </button>
          <button
            className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Model Dashboard
          </button>
        </div>

        <div className="glass-card">
          {activeTab === 'predict' && <PredictionForm />}
          {activeTab === 'batch' && <FileUpload />}
          {activeTab === 'dashboard' && <Dashboard />}
        </div>

        <footer style={{
          marginTop: '3rem',
          padding: '1.5rem 0',
          textAlign: 'center',
          borderTop: '1px solid #e0e0e0'
        }}>
          <p style={{
            color: '#7f8c8d',
            fontSize: '0.9rem',
            marginBottom: '0.5rem'
          }}>
            Built with React, Flask, and scikit-learn
          </p>
          <p style={{
            color: '#95a5a6',
            fontSize: '0.85rem'
          }}>
            © 2026 Loan Prediction System
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
