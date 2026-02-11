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
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            // Convert numeric fields to numbers
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
                headers: {
                    'Content-Type': 'application/json',
                },
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

    return (
        <div>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '600' }}>
                Loan Application Details
            </h2>
            <p style={{ marginBottom: '1.5rem', color: '#7f8c8d', fontSize: '1rem' }}>
                Fill in the applicant information to predict loan approval status
            </p>

            <form onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Gender</label>
                        <select name="Gender" value={formData.Gender} onChange={handleChange}>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Married</label>
                        <select name="Married" value={formData.Married} onChange={handleChange}>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Dependents</label>
                        <select name="Dependents" value={formData.Dependents} onChange={handleChange}>
                            <option value="0">0</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3+">3+</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Education</label>
                        <select name="Education" value={formData.Education} onChange={handleChange}>
                            <option value="Graduate">Graduate</option>
                            <option value="Not Graduate">Not Graduate</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Self Employed</label>
                        <select name="Self_Employed" value={formData.Self_Employed} onChange={handleChange}>
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Applicant Income ($)</label>
                        <input
                            type="number"
                            name="ApplicantIncome"
                            value={formData.ApplicantIncome}
                            onChange={handleChange}
                            placeholder="e.g., 5000"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Coapplicant Income ($)</label>
                        <input
                            type="number"
                            name="CoapplicantIncome"
                            value={formData.CoapplicantIncome}
                            onChange={handleChange}
                            placeholder="e.g., 2000"
                        />
                    </div>

                    <div className="form-group">
                        <label>Loan Amount ($1000s)</label>
                        <input
                            type="number"
                            name="LoanAmount"
                            value={formData.LoanAmount}
                            onChange={handleChange}
                            placeholder="e.g., 150"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Loan Term (months)</label>
                        <select name="Loan_Amount_Term" value={formData.Loan_Amount_Term} onChange={handleChange}>
                            <option value="360">360 (30 years)</option>
                            <option value="180">180 (15 years)</option>
                            <option value="120">120 (10 years)</option>
                            <option value="60">60 (5 years)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Credit History</label>
                        <select name="Credit_History" value={formData.Credit_History} onChange={handleChange}>
                            <option value="1">Good (1.0)</option>
                            <option value="0">Poor (0.0)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Property Area</label>
                        <select name="Property_Area" value={formData.Property_Area} onChange={handleChange}>
                            <option value="Urban">Urban</option>
                            <option value="Semiurban">Semiurban</option>
                            <option value="Rural">Rural</option>
                        </select>
                    </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                        <>
                            <div className="spinner"></div>
                            Predicting...
                        </>
                    ) : (
                        'Predict Loan Status'
                    )}
                </button>
            </form>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {result && (
                <div className={`result-card ${result.prediction === 'Approved' ? 'approved' : 'rejected'}`}>
                    <div className="result-header">
                        <div>
                            <div className="result-title">
                                Loan {result.prediction}
                            </div>
                            <p style={{
                                color: '#7f8c8d',
                                marginTop: '0.5rem',
                                fontSize: '1rem'
                            }}>
                                {result.prediction === 'Approved'
                                    ? 'The loan application is likely to be approved.'
                                    : 'The loan application is likely to be rejected.'}
                            </p>
                        </div>
                    </div>

                    <div className="result-details">
                        <div className="result-item">
                            <div className="result-item-label">Approval Probability</div>
                            <div className="result-item-value">
                                {(result.probability * 100).toFixed(2)}%
                            </div>
                            <div className="progress-bar" style={{ marginTop: '0.75rem' }}>
                                <div
                                    className="progress-fill"
                                    style={{ width: `${result.probability * 100}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="result-item">
                            <div className="result-item-label">Model Confidence</div>
                            <div className="result-item-value">
                                {(result.confidence * 100).toFixed(2)}%
                            </div>
                            <div className="progress-bar" style={{ marginTop: '0.75rem' }}>
                                <div
                                    className="progress-fill"
                                    style={{ width: `${result.confidence * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PredictionForm;
