import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function FileUpload() {
    const [file, setFile] = useState(null);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dragOver, setDragOver] = useState(false);

    const handleFileChange = (selectedFile) => {
        if (selectedFile && selectedFile.type === 'text/csv') {
            setFile(selectedFile);
            setError(null);
        } else {
            setError('Please select a valid CSV file');
            setFile(null);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        handleFileChange(droppedFile);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file first');
            return;
        }

        setLoading(true);
        setError(null);
        setResults(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_URL}/predict-batch`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setResults(data);
            } else {
                setError(data.error || 'Batch prediction failed');
            }
        } catch (err) {
            setError('Failed to connect to the server. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const downloadResults = () => {
        if (!results) return;

        const csv = [
            ['Loan ID', 'Prediction', 'Probability', 'Confidence'],
            ...results.predictions.map(p => [
                p.loan_id,
                p.prediction,
                p.probability ? (p.probability * 100).toFixed(2) + '%' : 'N/A',
                p.confidence ? (p.confidence * 100).toFixed(2) + '%' : 'N/A'
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'loan_predictions.csv';
        a.click();
    };

    return (
        <div>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.75rem', fontWeight: '800' }}>Batch Prediction from CSV</h2>
            <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
                Upload a CSV file with loan application data to get predictions for multiple applications at once.
            </p>

            <form onSubmit={handleSubmit}>
                <div
                    className={`file-upload ${dragOver ? 'drag-over' : ''}`}
                    onClick={() => document.getElementById('file-input').click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        id="file-input"
                        type="file"
                        accept=".csv"
                        onChange={(e) => handleFileChange(e.target.files[0])}
                    />
                    <div className="upload-icon">📊</div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                        {file ? file.name : 'Drag & Drop or Click to Upload'}
                    </h3>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.95rem' }}>
                        {file ? `${(file.size / 1024).toFixed(2)} KB` : 'Supports CSV files only'}
                    </p>
                </div>

                {file && (
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ marginTop: '1.5rem' }}
                    >
                        {loading ? (
                            <>
                                <div className="spinner"></div>
                                Processing...
                            </>
                        ) : (
                            <>
                                🚀 Process File
                            </>
                        )}
                    </button>
                )}
            </form>

            {error && (
                <div className="error-message">
                    ⚠️ {error}
                </div>
            )}

            {results && (
                <div style={{ marginTop: '2rem' }}>
                    <div className="success-message">
                        ✅ Successfully processed {results.total} loan applications
                    </div>

                    <div className="stats-grid" style={{ marginTop: '1.5rem' }}>
                        <div className="stat-card">
                            <div className="stat-label">Total Applications</div>
                            <div className="stat-value">{results.total}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Approved</div>
                            <div className="stat-value" style={{ color: 'var(--success-light)' }}>
                                {results.predictions.filter(p => p.prediction === 'Approved').length}
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Rejected</div>
                            <div className="stat-value" style={{ color: 'var(--danger-light)' }}>
                                {results.predictions.filter(p => p.prediction === 'Rejected').length}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={downloadResults}
                        className="btn btn-primary"
                        style={{ marginTop: '1.5rem' }}
                    >
                        💾 Download Results
                    </button>

                    <div style={{
                        marginTop: '2rem',
                        maxHeight: '400px',
                        overflowY: 'auto',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '16px',
                        padding: '1rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.2)' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700' }}>Loan ID</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700' }}>Prediction</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700' }}>Probability</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700' }}>Confidence</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.predictions.slice(0, 50).map((pred, idx) => (
                                    <tr key={idx} style={{
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                                        transition: 'background 0.2s ease'
                                    }}>
                                        <td style={{ padding: '0.875rem', fontWeight: '500' }}>{pred.loan_id}</td>
                                        <td style={{ padding: '0.875rem' }}>
                                            <span style={{
                                                padding: '0.375rem 1rem',
                                                borderRadius: '8px',
                                                background: pred.prediction === 'Approved'
                                                    ? 'rgba(34, 197, 94, 0.2)'
                                                    : 'rgba(239, 68, 68, 0.2)',
                                                color: pred.prediction === 'Approved' ? '#22c55e' : '#ef4444',
                                                fontWeight: '600',
                                                fontSize: '0.9rem'
                                            }}>
                                                {pred.prediction}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.875rem', fontWeight: '500' }}>
                                            {pred.probability ? (pred.probability * 100).toFixed(2) + '%' : 'N/A'}
                                        </td>
                                        <td style={{ padding: '0.875rem', fontWeight: '500' }}>
                                            {pred.confidence ? (pred.confidence * 100).toFixed(2) + '%' : 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {results.predictions.length > 50 && (
                            <p style={{
                                textAlign: 'center',
                                marginTop: '1.5rem',
                                color: 'var(--text-tertiary)',
                                fontSize: '0.95rem'
                            }}>
                                Showing first 50 results. Download CSV for complete data.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default FileUpload;
