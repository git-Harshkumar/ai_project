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
            setResults(null);
        } else {
            setError('Please select a valid CSV file');
            setFile(null);
        }
    };

    const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setDragOver(false); };
    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFileChange(e.dataTransfer.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) { setError('Please select a file first'); return; }

        setLoading(true);
        setError(null);
        setResults(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_URL}/api/predict-batch`, {
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

    const approvedCount = results?.predictions.filter(p => p.prediction === 'Approved').length ?? 0;
    const rejectedCount = results?.predictions.filter(p => p.prediction === 'Rejected').length ?? 0;
    const approvalRate = results ? Math.round((approvedCount / results.total) * 100) : 0;

    return (
        <div className="batch-page">
            {/* ── Upload Panel ── */}
            {!results && (
                <div className="batch-upload-layout">
                    {/* Left: Drop Zone */}
                    <div className="batch-drop-zone-wrap">
                        <form onSubmit={handleSubmit}>
                            <div
                                className={`batch-drop-zone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
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
                                    style={{ display: 'none' }}
                                />
                                <div className="drop-zone-icon">
                                    {file ? '📄' : dragOver ? '🎯' : '☁️'}
                                </div>
                                {file ? (
                                    <>
                                        <h3 className="drop-zone-title" style={{ color: 'var(--success-light)' }}>
                                            File Ready!
                                        </h3>
                                        <p className="drop-zone-filename">{file.name}</p>
                                        <p className="drop-zone-meta">
                                            {(file.size / 1024).toFixed(1)} KB · Click to change
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="drop-zone-title">
                                            {dragOver ? 'Drop it here!' : 'Drop your CSV file'}
                                        </h3>
                                        <p className="drop-zone-meta">
                                            Drag & drop or <span style={{ color: 'var(--primary-light)', fontWeight: '700' }}>browse</span> to select
                                        </p>
                                        <div className="drop-zone-hint">Accepted format: .CSV</div>
                                    </>
                                )}
                            </div>

                            {error && (
                                <div className="error-message" style={{ marginTop: '1.5rem' }}>
                                    <span>⚠️</span> {error}
                                </div>
                            )}

                            {file && (
                                <button
                                    type="submit"
                                    className="btn btn-primary batch-submit-btn"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <div className="spinner"></div>
                                            Processing {file.name}...
                                        </>
                                    ) : (
                                        <>⚡ Run Batch Analysis</>
                                    )}
                                </button>
                            )}
                        </form>
                    </div>

                    
                </div>
            )}

            {/* ── Results Panel ── */}
            {results && (
                <div className="batch-results" style={{ animation: 'fadeSlideUp 0.5s ease both' }}>
                    {/* Header */}
                    <div className="batch-results-header">
                        <div>
                            <h3 className="batch-results-title">✅ Analysis Complete</h3>
                            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                                Processed <strong>{results.total}</strong> applications from <strong>{file?.name}</strong>
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => { setResults(null); setFile(null); }}
                                className="btn"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}
                            >
                                ↩ New Upload
                            </button>
                            <button onClick={downloadResults} className="btn btn-primary">
                                💾 Export CSV
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="batch-stat-row">
                        <div className="batch-stat-item">
                            <div className="batch-stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-light)' }}>📊</div>
                            <div>
                                <div className="batch-stat-value">{results.total}</div>
                                <div className="batch-stat-label">Total Processed</div>
                            </div>
                        </div>
                        <div className="batch-stat-divider" />
                        <div className="batch-stat-item">
                            <div className="batch-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success-light)' }}>✅</div>
                            <div>
                                <div className="batch-stat-value" style={{ color: 'var(--success-light)' }}>{approvedCount}</div>
                                <div className="batch-stat-label">Approved</div>
                            </div>
                        </div>
                        <div className="batch-stat-divider" />
                        <div className="batch-stat-item">
                            <div className="batch-stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger-light)' }}>❌</div>
                            <div>
                                <div className="batch-stat-value" style={{ color: 'var(--danger-light)' }}>{rejectedCount}</div>
                                <div className="batch-stat-label">Rejected</div>
                            </div>
                        </div>
                        <div className="batch-stat-divider" />
                        <div className="batch-stat-item">
                            <div className="batch-stat-icon" style={{ background: 'rgba(250, 204, 21, 0.15)', color: '#facc15' }}>📈</div>
                            <div>
                                <div className="batch-stat-value" style={{ color: '#facc15' }}>{approvalRate}%</div>
                                <div className="batch-stat-label">Approval Rate</div>
                            </div>
                        </div>
                    </div>

                    {/* Approval Rate Bar */}
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.82rem', color: 'var(--text-tertiary)', fontWeight: '600' }}>
                            <span>✅ Approved ({approvalRate}%)</span>
                            <span>❌ Rejected ({100 - approvalRate}%)</span>
                        </div>
                        <div className="progress-bar" style={{ height: '10px', borderRadius: '99px' }}>
                            <div
                                className="progress-fill"
                                style={{
                                    width: `${approvalRate}%`,
                                    background: `linear-gradient(90deg, var(--success), var(--success-light))`,
                                    borderRadius: '99px'
                                }}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="batch-table-header">
                        <h4 style={{ margin: 0, fontFamily: 'Outfit', fontWeight: '700' }}>
                            📋 Prediction Ledger
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontFamily: 'Inter', fontWeight: '400', marginLeft: '0.75rem' }}>
                                Showing {Math.min(50, results.predictions.length)} of {results.total} records
                            </span>
                        </h4>
                    </div>
                    <div className="table-wrap" style={{ maxHeight: '440px', overflowY: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Application ID</th>
                                    <th>Decision</th>
                                    <th>Approval Probability</th>
                                    <th>Model Confidence</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.predictions.slice(0, 50).map((pred, idx) => (
                                    <tr key={idx}>
                                        <td style={{ color: 'var(--text-tertiary)', fontWeight: '600', fontSize: '0.8rem' }}>{idx + 1}</td>
                                        <td style={{ fontWeight: '700', color: 'var(--primary-light)', fontFamily: 'monospace' }}>#{pred.loan_id}</td>
                                        <td>
                                            <span className={`status-badge ${pred.prediction === 'Approved' ? 'approved' : 'rejected'}`}>
                                                {pred.prediction === 'Approved' ? '✅ Approved' : '❌ Rejected'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div className="progress-bar" style={{ height: '5px', width: '80px', flex: 'none' }}>
                                                    <div
                                                        className="progress-fill"
                                                        style={{
                                                            width: pred.probability ? `${pred.probability * 100}%` : '0%',
                                                            background: pred.prediction === 'Approved'
                                                                ? 'linear-gradient(90deg, var(--success), var(--success-light))'
                                                                : 'linear-gradient(90deg, var(--danger), var(--danger-light))'
                                                        }}
                                                    />
                                                </div>
                                                <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>
                                                    {pred.probability ? `${(pred.probability * 100).toFixed(1)}%` : 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                                            {pred.confidence ? `${(pred.confidence * 100).toFixed(1)}%` : 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {results.predictions.length > 50 && (
                        <p style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                            {results.total - 50} more records available — Export CSV to view all.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export default FileUpload;
