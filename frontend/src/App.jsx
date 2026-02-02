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
          <h1>🏦 Loan Prediction System</h1>
          <p>AI-Powered Loan Approval Prediction using Machine Learning</p>
        </header>

        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'predict' ? 'active' : ''}`}
            onClick={() => setActiveTab('predict')}
          >
            🔮 Single Prediction
          </button>
          <button
            className={`tab-button ${activeTab === 'batch' ? 'active' : ''}`}
            onClick={() => setActiveTab('batch')}
          >
            📊 Batch Prediction
          </button>
          <button
            className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📈 Model Dashboard
          </button>
        </div>

        <div className="glass-card">
          {activeTab === 'predict' && <PredictionForm />}
          {activeTab === 'batch' && <FileUpload />}
          {activeTab === 'dashboard' && <Dashboard />}
        </div>

        <footer style={{
          marginTop: '4rem',
          padding: '2rem 0',
          textAlign: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.95rem',
            marginBottom: '0.5rem'
          }}>
            Built with ❤️ using React, Flask, and scikit-learn
          </p>
          <p style={{
            color: 'var(--text-tertiary)',
            fontSize: '0.85rem'
          }}>
            © 2026 Loan Prediction System. Powered by Machine Learning.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
