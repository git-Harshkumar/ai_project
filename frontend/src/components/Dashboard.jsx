import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Dashboard() {
    const [modelInfo, setModelInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchModelInfo();
    }, []);

    const fetchModelInfo = async () => {
        try {
            const response = await fetch(`${API_URL}/api/model-info`);
            const data = await response.json();

            if (data.success) {
                setModelInfo(data.metrics);
            } else {
                setError(data.error || 'Failed to fetch model information');
            }
        } catch (err) {
            setError('Failed to connect to the server. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
                <div className="spinner" style={{ margin: '0 auto' }}></div>
                <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '1rem' }}>
                    Loading model information...
                </p>
            </div>
        );
    }

    if (error) {
        return <div className="error-message">⚠️ {error}</div>;
    }

    if (!modelInfo) {
        return <div className="error-message">⚠️ No model information available</div>;
    }

    return (
        <div className="view-container">
            <h2 className="section-title">🧠 Model Performance Dashboard</h2>
            <p className="section-subtitle">
                Comprehensive metrics and insights about the loan prediction model's behavioral analysis
            </p>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">🤖 Architecture</div>
                    <div className="stat-value" style={{ fontSize: '1.4rem' }}>
                        {modelInfo.model_name}
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-label">🎯 Aggregate Accuracy</div>
                    <div className="stat-value">{(modelInfo.accuracy * 100).toFixed(1)}%</div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${modelInfo.accuracy * 100}%` }}></div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-label">📈 ROC-AUC Confidence</div>
                    <div className="stat-value">{(modelInfo.roc_auc * 100).toFixed(1)}%</div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${modelInfo.roc_auc * 100}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Classification Report */}
            {modelInfo.classification_report && (
                <div className="form-section" style={{ marginTop: '3rem' }}>
                    <div className="form-section-title">📊 Precision & Recall Ledger</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '1.5rem' }}>
                        Detailed statistical report on the model's classification capabilities for different classes
                    </p>
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Target Class</th>
                                    <th style={{ textAlign: 'center' }}>Precision</th>
                                    <th style={{ textAlign: 'center' }}>Recall</th>
                                    <th style={{ textAlign: 'center' }}>F1-Score</th>
                                    <th style={{ textAlign: 'center' }}>Data Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(modelInfo.classification_report)
                                    .filter(([key]) => ['0', '1'].includes(key))
                                    .map(([className, metrics]) => (
                                        <tr key={className}>
                                            <td style={{ fontWeight: '700', color: 'var(--text-secondary)' }}>
                                                {className === '0' ? '❌ Rejected' : '✅ Approved'}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>{(metrics.precision * 100).toFixed(1)}%</td>
                                            <td style={{ textAlign: 'center' }}>{(metrics.recall * 100).toFixed(1)}%</td>
                                            <td style={{ textAlign: 'center', fontWeight: '700', color: 'var(--primary-light)' }}>
                                                {(metrics['f1-score'] * 100).toFixed(1)}%
                                            </td>
                                            <td style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>{metrics.support} pts</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="form-grid" style={{ marginTop: '3rem' }}>
                {/* Confusion Matrix Heatmap */}
                {modelInfo.confusion_matrix && (
                    <div className="form-section">
                        <div className="form-section-title">📍 Confusion Matrix Heatmap</div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
                            Visualizing true vs false classifications
                        </p>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '1rem',
                            marginTop: '1rem'
                        }}>
                            <div className="heatmap-cell" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                                <span className="heatmap-value">{modelInfo.confusion_matrix[0][0]}</span>
                                <span className="heatmap-label">True Approved</span>
                            </div>
                            <div className="heatmap-cell" style={{ background: 'rgba(239, 68, 68, 0.05)' }}>
                                <span className="heatmap-value">{modelInfo.confusion_matrix[0][1]}</span>
                                <span className="heatmap-label">False Rejected</span>
                            </div>
                            <div className="heatmap-cell" style={{ background: 'rgba(239, 68, 68, 0.05)' }}>
                                <span className="heatmap-value">{modelInfo.confusion_matrix[1][0]}</span>
                                <span className="heatmap-label">False Approved</span>
                            </div>
                            <div className="heatmap-cell" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                                <span className="heatmap-value">{modelInfo.confusion_matrix[1][1]}</span>
                                <span className="heatmap-label">True Rejected</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Feature Importance */}
                {modelInfo.feature_importance && (
                    <div className="form-section">
                        <div className="form-section-title">⚡ Feature Influence Ranking</div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '1.25rem' }}>
                            Key factors impacting decisions
                        </p>
                        <div style={{ display: 'grid', gap: '1.25rem' }}>
                            {modelInfo.feature_importance.slice(0, 6).map((item, idx) => (
                                <div key={idx}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            {item.feature}
                                        </span>
                                        <span style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--primary-light)' }}>
                                            {(item.importance * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="progress-bar" style={{ height: '6px' }}>
                                        <div
                                            className="progress-fill"
                                            style={{
                                                width: `${item.importance * 100}%`,
                                                background: `linear-gradient(90deg, var(--primary) ${100 - (item.importance * 100)}%, var(--accent) 100%)`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
