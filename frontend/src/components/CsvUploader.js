import React, { useState } from 'react';
import { api } from '../services/api';
import { toast } from 'sonner';

const CsvUploader = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a valid CSV file');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await api.uploadCSV(file);
      setResult(data);
      toast.success('CSV processed successfully');
      if (onUploadSuccess) {
        onUploadSuccess(data);
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to upload CSV';
      setError(msg);
      toast.error(msg);
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await fetch('/sample.csv');
      const text = await resp.text();
      const blob = new Blob([text], { type: 'text/csv' });
      const sampleFile = new File([blob], 'sample.csv', { type: 'text/csv' });
      setFile(sampleFile);
      // auto-upload for smooth demo
      const data = await api.uploadCSV(sampleFile);
      setResult(data);
      toast.success('Loaded demo dataset');
      onUploadSuccess?.(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load demo dataset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="csv-uploader" data-testid="csv-uploader">
      <div className="upload-section">
        <h2>Upload Campaign Data</h2>
        <p className="subtitle">Upload your Meta Ads or Google Ads CSV export</p>
        
        <div className="file-input-container">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            id="csv-file-input"
            data-testid="csv-file-input"
            className="file-input"
          />
          <label htmlFor="csv-file-input" className="file-label">
            {file ? file.name : 'Choose CSV file...'}
          </label>
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="upload-button"
          data-testid="upload-button"
        >
          {loading ? 'Processing...' : 'Upload & Normalize'}
        </button>
        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <button onClick={handleLoadSample} disabled={loading} className="details-toggle" data-testid="load-sample-button">
            ▶ Load Demo Dataset
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message" data-testid="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {result && (
        <div className="upload-result" data-testid="upload-result">
          <h3>✅ CSV Processed Successfully</h3>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{result.cleaned_rows}</div>
              <div className="stat-label">Clean Rows</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{result.dropped_rows}</div>
              <div className="stat-label">Dropped Rows</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{result.duplicates_merged}</div>
              <div className="stat-label">Duplicates Merged</div>
            </div>
          </div>

          {result.warnings && result.warnings.length > 0 && (
            <div className="warnings" data-testid="warnings">
              <h4>⚠️ Warnings:</h4>
              <ul>
                {result.warnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {result.preview && result.preview.length > 0 && (
            <div className="data-preview">
              <h4>Data Preview (first 20 rows):</h4>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Campaign</th>
                      <th>Platform</th>
                      <th>Spend</th>
                      <th>CTR</th>
                      <th>CPA</th>
                      <th>ROAS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.preview.map((row, idx) => (
                      <tr key={idx}>
                        <td>{row.date}</td>
                        <td>{row.campaign_name}</td>
                        <td>
                          <span className={`platform-badge ${row.platform}`}>
                            {row.platform}
                          </span>
                        </td>
                        <td>₹{row.spend.toLocaleString()}</td>
                        <td>{row.ctr}%</td>
                        <td>₹{row.cpa}</td>
                        <td>{row.roas}x</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CsvUploader;
