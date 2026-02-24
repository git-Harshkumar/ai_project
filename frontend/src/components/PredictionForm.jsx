import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function PredictionForm() {
    const [formData, setFormData] = useState({
        Gender: 'Male',
        Married: 'Yes',
        Dependents: '0',
        Education: 'Graduate',
        Self_Employed: 'No',
        ApplicantIncome: '',
        CoapplicantIncome: '',
        LoanAmount: '',
        Loan_Amount_Term: '360',
        Credit_History: '1',
        Property_Area: 'Urban'
    });

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const payload = {
                ...formData,
                ApplicantIncome: parseFloat(formData.ApplicantIncome) || 0,
                CoapplicantIncome: parseFloat(formData.CoapplicantIncome) || 0,
                LoanAmount: parseFloat(formData.LoanAmount) || 0,
                Loan_Amount_Term: parseFloat(formData.Loan_Amount_Term) || 360,
                Credit_History: parseFloat(formData.Credit_History) || 1
            };

            const response = await fetch(`${API_URL}/api/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                setResult(data.data);
            } else {
                setError(data.error || 'Prediction failed');
            }
        } catch (err) {
            setError('Failed to connect to the server. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const isApproved = result?.prediction === 'Approved';

    return (
        <div className="view-container">
            {/* <h2 className="section-title">📊 Single Loan Analysis</h2> */}
            <p className="section-subtitle">
                Enter applicant details to generate a real-time AI-powered approval prediction
            </p>

            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    {/* Section 1: Personal Profile */}
                    <div className="form-section">
                        <div className="form-section-title">👤 Personal Profile</div>

                        <div className="form-group">
                            <label>Gender</label>
                            <div className="input-icon-wrap">
                                <span className="input-icon">🚻</span>
                                <select className="input-with-icon" name="Gender" value={formData.Gender} onChange={handleChange}>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Marital Status</label>
                            <div className="input-icon-wrap">
                                <span className="input-icon">💍</span>
                                <select className="input-with-icon" name="Married" value={formData.Married} onChange={handleChange}>
                                    <option value="Yes">Married</option>
                                    <option value="No">Single</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Dependents</label>
                            <div className="input-icon-wrap">
                                <span className="input-icon">👨‍👩‍👧</span>
                                <select className="input-with-icon" name="Dependents" value={formData.Dependents} onChange={handleChange}>
                                    <option value="0">None (0)</option>
                                    <option value="1">Small (1)</option>
                                    <option value="2">Medium (2)</option>
                                    <option value="3+">Large (3+)</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Education</label>
                            <div className="input-icon-wrap">
                                <span className="input-icon">🎓</span>
                                <select className="input-with-icon" name="Education" value={formData.Education} onChange={handleChange}>
                                    <option value="Graduate">Graduate</option>
                                    <option value="Not Graduate">Undergraduate</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Financial Status */}
                    <div className="form-section">
                        <div className="form-section-title">💰 Financial Status</div>

                        <div className="form-group">
                            <label>Employment Type</label>
                            <div className="input-icon-wrap">
                                <span className="input-icon">💼</span>
                                <select className="input-with-icon" name="Self_Employed" value={formData.Self_Employed} onChange={handleChange}>
                                    <option value="No">Salaried Employee</option>
                                    <option value="Yes">Self-Employed / Business</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Monthly Applicant Income ($)</label>
                            <div className="input-icon-wrap">
                                <span className="input-icon">💵</span>
                                <input
                                    className="input-with-icon"
                                    type="number"
                                    name="ApplicantIncome"
                                    value={formData.ApplicantIncome}
                                    onChange={handleChange}
                                    placeholder="e.g., 5500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Monthly Co-applicant Income ($)</label>
                            <div className="input-icon-wrap">
                                <span className="input-icon">🏦</span>
                                <input
                                    className="input-with-icon"
                                    type="number"
                                    name="CoapplicantIncome"
                                    value={formData.CoapplicantIncome}
                                    onChange={handleChange}
                                    placeholder="e.g., 2000"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Credit History Rating</label>
                            <div className="input-icon-wrap">
                                <span className="input-icon">📜</span>
                                <select className="input-with-icon" name="Credit_History" value={formData.Credit_History} onChange={handleChange}>
                                    <option value="1">Excellent (1.0)</option>
                                    <option value="0">Poor / Unscored (0.0)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Loan Details */}
                    <div className="form-section">
                        <div className="form-section-title">📝 Loan Configuration</div>

                        <div className="form-group">
                            <label>Requested Loan Amount ($1,000s)</label>
                            <div className="input-icon-wrap">
                                <span className="input-icon">💎</span>
                                <input
                                    className="input-with-icon"
                                    type="number"
                                    name="LoanAmount"
                                    value={formData.LoanAmount}
                                    onChange={handleChange}
                                    placeholder="e.g., 150"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Loan Tenure (Duration)</label>
                            <div className="input-icon-wrap">
                                <span className="input-icon">📅</span>
                                <select className="input-with-icon" name="Loan_Amount_Term" value={formData.Loan_Amount_Term} onChange={handleChange}>
                                    <option value="360">30 Years (360 months)</option>
                                    <option value="180">15 Years (180 months)</option>
                                    <option value="120">10 Years (120 months)</option>
                                    <option value="60">5 Years (60 months)</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Property Geographic Area</label>
                            <div className="input-icon-wrap">
                                <span className="input-icon">📍</span>
                                <select className="input-with-icon" name="Property_Area" value={formData.Property_Area} onChange={handleChange}>
                                    <option value="Urban">Urban Center</option>
                                    <option value="Semiurban">Semi-Urban Suburbs</option>
                                    <option value="Rural">Rural Landscape</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
                        {loading ? (
                            <>
                                <div className="spinner"></div>
                                AI Engine Analysis Running...
                            </>
                        ) : (
                            'Generate AI Prediction'
                        )}
                    </button>
                </div>
            </form>

            {error && (
                <div className="error-message">
                    <span>⚠️</span> {error}
                </div>
            )}

            {result && (
                <div className={`result-card ${isApproved ? 'approved' : 'rejected'}`}>
                    <div className="result-header">
                        <div className="result-icon">{isApproved ? '✅' : '❌'}</div>
                        <div>
                            <div className={`result-title ${isApproved ? 'approved' : 'rejected'}`}>
                                Loan {result.prediction}
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', fontWeight: '500' }}>
                                {isApproved
                                    ? 'Applicant meets standard risk profiles for approval.'
                                    : 'Applicant risk profiles suggests a higher probability of rejection.'}
                            </p>
                        </div>
                    </div>

                    <div className="result-details">
                        <div className="result-item">
                            <div className="result-item-label">📊 Approval Probability</div>
                            <div className="result-item-value">
                                {(result.probability * 100).toFixed(1)}%
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${result.probability * 100}%` }}></div>
                            </div>
                        </div>

                        <div className="result-item">
                            <div className="result-item-label">⭐ Optimization Confidence</div>
                            <div className="result-item-value">
                                {(result.confidence * 100).toFixed(1)}%
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${result.confidence * 100}%` }}></div>
                            </div>
                        </div>

                        <div className="result-item">
                            <div className="result-item-label">🔍 Risk Tier</div>
                            <div className="result-item-value" style={{ fontSize: '1.8rem', marginTop: '0.5rem' }}>
                                <span className={`badge ${isApproved ? 'badge-success' : 'badge-danger'}`}>
                                    {isApproved ? 'Low Risk' : 'High Risk'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PredictionForm;
