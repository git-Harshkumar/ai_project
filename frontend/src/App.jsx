import { useState } from 'react';
import Dashboard from './components/Dashboard';
import FileUpload from './components/FileUpload';
import PredictionForm from './components/PredictionForm';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('predict');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false); // Close sidebar when a tab is clicked
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <div className="header-content">
            <button
              className="hamburger-menu"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            <div className="header-text">
              <h1>Loan Prediction System</h1>
              <p>AI-Powered Loan Approval Prediction using Machine Learning</p>
            </div>
          </div>
        </header>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Navigation - Desktop navbar / Mobile sidebar */}
        <nav className={`navigation ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <button
            className={`nav-button ${activeTab === 'predict' ? 'active' : ''}`}
            onClick={() => handleTabClick('predict')}
          >
            <span className="nav-icon">📊</span>
            Single Prediction
          </button>
          <button
            className={`nav-button ${activeTab === 'batch' ? 'active' : ''}`}
            onClick={() => handleTabClick('batch')}
          >
            <span className="nav-icon">📁</span>
            Batch Prediction
          </button>
          <button
            className={`nav-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleTabClick('dashboard')}
          >
            <span className="nav-icon">📈</span>
            Model Dashboard
          </button>
        </nav>

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
