import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const FEATURE_ICONS = {
    Credit_History: '💳',
    ApplicantIncome: '💰',
    LoanAmount: '🏦',
    CoapplicantIncome: '👥',
    Loan_Amount_Term: '📅',
    TotalIncome: '💵',
    Property_Area: '🏘️',
    Education: '🎓',
    Dependents: '👨‍👩‍👧',
    Gender: '⚧',
    Married: '💍',
    Self_Employed: '🧑‍💼',
};

function Dashboard() {
    const [modelInfo, setModelInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => { fetchModelInfo(); }, []);

    const fetchModelInfo = async () => {
        try {
            const response = await fetch(`${API_URL}/api/model-info`);
            const data = await response.json();
            if (data.success) setModelInfo(data.metrics);
            else setError(data.error || 'Failed to fetch model information');
        } catch {
            setError('Failed to connect to the server. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="dash-loading">
            <div className="dash-loading-spinner"></div>
            <p>Loading model insights...</p>
        </div>
    );

    if (error) return (
        <div className="dash-error">
            <span className="dash-error-icon">⚠️</span>
            <h3>Connection Error</h3>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchModelInfo} style={{ marginTop: '1.5rem' }}>
                Retry
            </button>
        </div>
    );

    if (!modelInfo) return <div className="dash-error">⚠️ No model information available</div>;

    const accuracy = (modelInfo.accuracy * 100).toFixed(1);
    const roc = modelInfo.roc_auc ? (modelInfo.roc_auc * 100).toFixed(1) : null;
    const cm = modelInfo.confusion_matrix;
    const tn = cm?.[0]?.[0], fp = cm?.[0]?.[1], fn = cm?.[1]?.[0], tp = cm?.[1]?.[1];
    const precision = modelInfo.classification_report?.['1']?.precision;
    const recall = modelInfo.classification_report?.['1']?.recall;
    const f1 = modelInfo.classification_report?.['1']?.['f1-score'];
    const maxImportance = modelInfo.feature_importance?.[0]?.importance || 1;

    return (
        <div className="dash-root">

            {/* ── KPI Hero Row ── */}
            <div className="dash-kpi-row">
                <div className="dash-kpi-card primary">
                    <div className="dash-kpi-icon">🎯</div>
                    <div className="dash-kpi-body">
                        <div className="dash-kpi-value">{accuracy}%</div>
                        <div className="dash-kpi-label">Model Accuracy</div>
                    </div>
                    <div className="dash-kpi-ring">
                        <svg viewBox="0 0 36 36" className="dash-ring-svg">
                            <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="3" />
                            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#6366f1" strokeWidth="3"
                                strokeDasharray={`${accuracy} ${100 - accuracy}`} strokeLinecap="round"
                                transform="rotate(-90 18 18)" />
                        </svg>
                    </div>
                </div>

                {roc && (
                    <div className="dash-kpi-card accent">
                        <div className="dash-kpi-icon">📈</div>
                        <div className="dash-kpi-body">
                            <div className="dash-kpi-value">{roc}%</div>
                            <div className="dash-kpi-label">ROC-AUC Score</div>
                        </div>
                        <div className="dash-kpi-ring">
                            <svg viewBox="0 0 36 36" className="dash-ring-svg">
                                <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(6,182,212,0.15)" strokeWidth="3" />
                                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#06b6d4" strokeWidth="3"
                                    strokeDasharray={`${roc} ${100 - roc}`} strokeLinecap="round"
                                    transform="rotate(-90 18 18)" />
                            </svg>
                        </div>
                    </div>
                )}

                {precision && (
                    <div className="dash-kpi-card success">
                        <div className="dash-kpi-icon">✅</div>
                        <div className="dash-kpi-body">
                            <div className="dash-kpi-value">{(precision * 100).toFixed(1)}%</div>
                            <div className="dash-kpi-label">Precision</div>
                        </div>
                    </div>
                )}

                {recall && (
                    <div className="dash-kpi-card warning">
                        <div className="dash-kpi-icon">🔍</div>
                        <div className="dash-kpi-body">
                            <div className="dash-kpi-value">{(recall * 100).toFixed(1)}%</div>
                            <div className="dash-kpi-label">Recall</div>
                        </div>
                    </div>
                )}

                {f1 && (
                    <div className="dash-kpi-card danger">
                        <div className="dash-kpi-icon">⚡</div>
                        <div className="dash-kpi-body">
                            <div className="dash-kpi-value">{(f1 * 100).toFixed(1)}%</div>
                            <div className="dash-kpi-label">F1-Score</div>
                        </div>
                    </div>
                )}

                <div className="dash-kpi-card model-name">
                    <div className="dash-kpi-icon">🤖</div>
                    <div className="dash-kpi-body">
                        <div className="dash-kpi-value" style={{ fontSize: '1rem', lineHeight: 1.3 }}>
                            {modelInfo.model_name || 'Random Forest'}
                        </div>
                        <div className="dash-kpi-label">Algorithm</div>
                    </div>
                </div>
            </div>

            {/* ── Bottom Grid: Confusion Matrix + Feature Importance ── */}
            <div className="dash-grid">

                {/* Confusion Matrix */}
                {cm && (
                    <div className="dash-card">
                        <div className="dash-card-header">
                            <span className="dash-card-icon">📍</span>
                            <div>
                                <h3 className="dash-card-title">Confusion Matrix</h3>
                                <p className="dash-card-sub">Predicted vs actual outcomes</p>
                            </div>
                        </div>

                        <div className="dash-matrix">
                            <div className="dash-matrix-labels">
                                <span></span>
                                <span className="dash-matrix-col-label">Pred: Approved</span>
                                <span className="dash-matrix-col-label">Pred: Rejected</span>
                            </div>
                            <div className="dash-matrix-row">
                                <span className="dash-matrix-row-label">Act: Approved</span>
                                <div className="dash-matrix-cell green">
                                    <span className="dash-matrix-val">{tn}</span>
                                    <span className="dash-matrix-tag">True Positive</span>
                                </div>
                                <div className="dash-matrix-cell red-light">
                                    <span className="dash-matrix-val">{fp}</span>
                                    <span className="dash-matrix-tag">False Negative</span>
                                </div>
                            </div>
                            <div className="dash-matrix-row">
                                <span className="dash-matrix-row-label">Act: Rejected</span>
                                <div className="dash-matrix-cell red-light">
                                    <span className="dash-matrix-val">{fn}</span>
                                    <span className="dash-matrix-tag">False Positive</span>
                                </div>
                                <div className="dash-matrix-cell green">
                                    <span className="dash-matrix-val">{tp}</span>
                                    <span className="dash-matrix-tag">True Negative</span>
                                </div>
                            </div>
                        </div>

                        {/* Class breakdown */}
                        {modelInfo.classification_report && (
                            <div className="dash-class-row">
                                {[['0', '❌ Rejected'], ['1', '✅ Approved']].map(([key, label]) => {
                                    const m = modelInfo.classification_report[key];
                                    if (!m) return null;
                                    return (
                                        <div key={key} className="dash-class-item">
                                            <div className="dash-class-label">{label}</div>
                                            <div className="dash-class-stats">
                                                <span>P: <b>{(m.precision * 100).toFixed(0)}%</b></span>
                                                <span>R: <b>{(m.recall * 100).toFixed(0)}%</b></span>
                                                <span>F1: <b>{(m['f1-score'] * 100).toFixed(0)}%</b></span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Feature Importance */}
                {modelInfo.feature_importance && (
                    <div className="dash-card">
                        <div className="dash-card-header">
                            <span className="dash-card-icon">⚡</span>
                            <div>
                                <h3 className="dash-card-title">Feature Importance</h3>
                                <p className="dash-card-sub">Top predictors ranked by influence</p>
                            </div>
                        </div>

                        <div className="dash-features">
                            {modelInfo.feature_importance.slice(0, 8).map((item, idx) => {
                                const pct = (item.importance / maxImportance) * 100;
                                const valPct = (item.importance * 100).toFixed(1);
                                const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
                                return (
                                    <div key={idx} className="dash-feature-row">
                                        <div className="dash-feature-left">
                                            <span className="dash-feature-rank">#{idx + 1}</span>
                                            <span className="dash-feature-icon">{FEATURE_ICONS[item.feature] || '📊'}</span>
                                            <span className="dash-feature-name">{item.feature}</span>
                                        </div>
                                        <div className="dash-feature-bar-wrap">
                                            <div className="dash-feature-bar">
                                                <div className="dash-feature-fill" style={{ width: `${pct}%`, background: colors[idx] }} />
                                            </div>
                                            <span className="dash-feature-pct">{valPct}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
