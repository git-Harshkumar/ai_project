import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:5000/api';

function Dashboard() {
    const [modelInfo, setModelInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchModelInfo();
    }, []);

    const fetchModelInfo = async () => {
        try {
            const response = await fetch(`${API_URL}/model-info`);
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
                <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
                    Loading model information...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-message">
                ⚠️ {error}
            </div>
        );
    }

    if (!modelInfo) {
        return (
            <div className="error-message">
                ⚠️ No model information available
            </div>
        );
    }

    return (
        <div>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.75rem', fontWeight: '800' }}>
                Model Performance Dashboard
            </h2>
            <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
                Comprehensive metrics and insights about the loan prediction model
            </p>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">🤖 Model Type</div>
                    <div className="stat-value" style={{ fontSize: '1.5rem' }}>
                        {modelInfo.model_name}
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-label">🎯 Accuracy</div>
                    <div className="stat-value">
                        {(modelInfo.accuracy * 100).toFixed(2)}%
                    </div>
                    <div className="progress-bar" style={{ marginTop: '1rem' }}>
                        <div
                            className="progress-fill"
                            style={{ width: `${modelInfo.accuracy * 100}%` }}
                        ></div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-label">📊 ROC-AUC Score</div>
                    <div className="stat-value">
                        {(modelInfo.roc_auc * 100).toFixed(2)}%
                    </div>
                    <div className="progress-bar" style={{ marginTop: '1rem' }}>
                        <div
                            className="progress-fill"
                            style={{ width: `${modelInfo.roc_auc * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {modelInfo.classification_report && (
                <div style={{ marginTop: '2.5rem' }}>
                    <h3 style={{
                        marginBottom: '1.25rem',
                        fontSize: '1.4rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        📈 Classification Report
                    </h3>
                    <div style={{
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(10px)',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        border: '1px solid var(--glass-border)',
                        overflowX: 'auto'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.2)' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700' }}>Class</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '700' }}>Precision</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '700' }}>Recall</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '700' }}>F1-Score</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '700' }}>Support</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(modelInfo.classification_report)
                                    .filter(([key]) => ['0', '1'].includes(key))
                                    .map(([className, metrics]) => (
                                        <tr key={className} style={{
                                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                            transition: 'background 0.2s ease'
                                        }}>
                                            <td style={{ padding: '1rem', fontWeight: '600' }}>
                                                {className === '0' ? '❌ Rejected' : '✅ Approved'}
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center', fontWeight: '500' }}>
                                                {(metrics.precision * 100).toFixed(2)}%
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center', fontWeight: '500' }}>
                                                {(metrics.recall * 100).toFixed(2)}%
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center', fontWeight: '500' }}>
                                                {(metrics['f1-score'] * 100).toFixed(2)}%
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>
                                                {metrics.support}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {modelInfo.confusion_matrix && (
                <div style={{ marginTop: '2.5rem' }}>
                    <h3 style={{
                        marginBottom: '1.25rem',
                        fontSize: '1.4rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        🎲 Confusion Matrix
                    </h3>
                    <div style={{
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(10px)',
                        padding: '2rem',
                        borderRadius: '16px',
                        border: '1px solid var(--glass-border)',
                        display: 'inline-block'
                    }}>
                        <table style={{ borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '1rem' }}></th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '700' }}>
                                        Predicted Rejected
                                    </th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '700' }}>
                                        Predicted Approved
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '1rem', fontWeight: '700' }}>Actual Rejected</td>
                                    <td style={{
                                        padding: '1.5rem',
                                        textAlign: 'center',
                                        background: 'rgba(34, 197, 94, 0.15)',
                                        fontSize: '1.75rem',
                                        fontWeight: '800',
                                        borderRadius: '12px',
                                        border: '2px solid rgba(34, 197, 94, 0.3)'
                                    }}>
                                        {modelInfo.confusion_matrix[0][0]}
                                    </td>
                                    <td style={{
                                        padding: '1.5rem',
                                        textAlign: 'center',
                                        background: 'rgba(239, 68, 68, 0.15)',
                                        fontSize: '1.75rem',
                                        fontWeight: '800',
                                        borderRadius: '12px',
                                        border: '2px solid rgba(239, 68, 68, 0.3)'
                                    }}>
                                        {modelInfo.confusion_matrix[0][1]}
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '1rem', fontWeight: '700' }}>Actual Approved</td>
                                    <td style={{
                                        padding: '1.5rem',
                                        textAlign: 'center',
                                        background: 'rgba(239, 68, 68, 0.15)',
                                        fontSize: '1.75rem',
                                        fontWeight: '800',
                                        borderRadius: '12px',
                                        border: '2px solid rgba(239, 68, 68, 0.3)'
                                    }}>
                                        {modelInfo.confusion_matrix[1][0]}
                                    </td>
                                    <td style={{
                                        padding: '1.5rem',
                                        textAlign: 'center',
                                        background: 'rgba(34, 197, 94, 0.15)',
                                        fontSize: '1.75rem',
                                        fontWeight: '800',
                                        borderRadius: '12px',
                                        border: '2px solid rgba(34, 197, 94, 0.3)'
                                    }}>
                                        {modelInfo.confusion_matrix[1][1]}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {modelInfo.feature_importance && (
                <div style={{ marginTop: '2.5rem' }}>
                    <h3 style={{
                        marginBottom: '1.25rem',
                        fontSize: '1.4rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        ⭐ Top 10 Feature Importances
                    </h3>
                    <div style={{
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(10px)',
                        padding: '2rem',
                        borderRadius: '16px',
                        border: '1px solid var(--glass-border)'
                    }}>
                        {modelInfo.feature_importance.slice(0, 10).map((item, idx) => (
                            <div key={idx} style={{ marginBottom: '1.5rem' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '0.5rem',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ fontWeight: '600', fontSize: '1rem' }}>
                                        {idx + 1}. {item.feature}
                                    </span>
                                    <span style={{
                                        fontWeight: '800',
                                        fontSize: '1.1rem',
                                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text'
                                    }}>
                                        {(item.importance * 100).toFixed(2)}%
                                    </span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${item.importance * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
