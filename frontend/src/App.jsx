import { useState } from 'react';
import Dashboard from './components/Dashboard';
import FileUpload from './components/FileUpload';
import PredictionForm from './components/PredictionForm';
import SplashScreen from './components/SplashScreen';
import './index.css';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('predict');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <div className="app-root top-nav-layout">
      {/* ── Main Content Area ── */}
      <main className="main-content">
        <header className="top-bar">
          <div className="top-bar-brand">
            <div className="brand-logo">
              <img src="/logo.png" alt="Logo" style={{ height: '42px', width: 'auto', objectFit: 'contain' }} />
            </div>
            <div className="brand-text">
              <h2>OpenAI</h2>
              <p>V2.0.4 Premium</p>
            </div>
          </div>

          <nav className="top-nav">
            <button
              className={`top-nav-item ${activeTab === 'predict' ? 'active' : ''}`}
              onClick={() => setActiveTab('predict')}
            >
              <span className="nav-icon">📊</span>
              <span className="nav-label">Analysis</span>
            </button>
            <button
              className={`top-nav-item ${activeTab === 'batch' ? 'active' : ''}`}
              onClick={() => setActiveTab('batch')}
            >
              <span className="nav-icon">📁</span>
              <span className="nav-label">Batch</span>
            </button>
            <button
              className={`top-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <span className="nav-icon">📈</span>
              <span className="nav-label">Insights</span>
            </button>
          </nav>


        </header>

        <section className="content-view">
          <div className="glass-panel">
            <div className="view-header">
              <h1 className="view-title">
                {activeTab === 'predict' ? 'Single Loan Analysis' :
                  activeTab === 'batch' ? 'Batch Processing' : 'Model Dashboard'}
              </h1>
              <p className="view-subtitle">AI-Powered Prediction Engine · Real-time Inference</p>
            </div>

            {activeTab === 'predict' && <PredictionForm />}
            {activeTab === 'batch' && <FileUpload />}
            {activeTab === 'dashboard' && <Dashboard />}
          </div>
        </section>

        <footer className="app-footer">
          <p>Built with <span className="tech-accent">React · Flask · scikit-learn</span> · © 2026 OpenAI</p>
        </footer>
      </main>
    </div>
  );
}

export default App;
