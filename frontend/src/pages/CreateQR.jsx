import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { qrApi } from '../services/api';

/**
 * Create QR Page Component
 * Form for creating new dynamic QR codes
 */
function CreateQR() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState('');
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdQR, setCreatedQR] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!destination) {
      setError('Please enter a destination URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(destination);
    } catch {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    setLoading(true);

    try {
      const { qrCode } = await qrApi.createQR(destination, label);
      setCreatedQR(qrCode);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnother = () => {
    setCreatedQR(null);
    setDestination('');
    setLabel('');
  };

  const handleCopyUrl = () => {
    if (createdQR) {
      const url = qrApi.getRedirectUrl(createdQR.qrId);
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="container header__inner">
          <Link to="/dashboard" className="header__logo">
            <div className="header__logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </div>
            <span>QR Dynamic</span>
          </Link>
          <nav className="header__nav">
            <Link to="/dashboard" className="btn btn--ghost">
              ← Back to Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="page">
        <div className="container" style={{ maxWidth: '600px' }}>
          {/* Success State - Show Created QR */}
          {createdQR ? (
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <span style={{ fontSize: '48px' }}>🎉</span>
              </div>
              <h1 style={{ marginBottom: 'var(--spacing-sm)' }}>
                QR Code Created!
              </h1>
              <p className="text-muted" style={{ marginBottom: 'var(--spacing-xl)' }}>
                Your dynamic QR code is ready to use
              </p>

              {/* QR Code Preview */}
              <div
                style={{
                  background: 'white',
                  padding: 'var(--spacing-lg)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'inline-block',
                  marginBottom: 'var(--spacing-lg)'
                }}
              >
                <img
                  src={createdQR.qrUrl}
                  alt={createdQR.label}
                  style={{ display: 'block', width: 200, height: 200 }}
                />
              </div>

              {/* QR Details */}
              <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                  <strong>{createdQR.label}</strong>
                </div>
                <div className="text-muted" style={{ wordBreak: 'break-all' }}>
                  {createdQR.destination}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-md" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={handleCopyUrl} className="btn btn--secondary">
                  📋 Copy URL
                </button>
                <a
                  href={createdQR.qrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--secondary"
                >
                  ⬇️ Download
                </a>
                <button onClick={handleCreateAnother} className="btn btn--primary">
                  + Create Another
                </button>
              </div>

              <div className="mt-lg">
                <Link to="/dashboard" className="text-muted">
                  Go to Dashboard →
                </Link>
              </div>
            </div>
          ) : (
            /* Create Form */
            <div className="card">
              <h1 style={{ marginBottom: 'var(--spacing-sm)' }}>
                Create QR Code
              </h1>
              <p className="text-muted" style={{ marginBottom: 'var(--spacing-xl)' }}>
                Enter a destination URL to generate a dynamic QR code
              </p>

              {/* Error Message */}
              {error && (
                <div
                  className="toast toast--error"
                  style={{
                    position: 'relative',
                    bottom: 'auto',
                    right: 'auto',
                    marginBottom: 'var(--spacing-lg)'
                  }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="destination">
                    Destination URL *
                  </label>
                  <input
                    id="destination"
                    type="url"
                    className="form-input"
                    placeholder="https://example.com"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    disabled={loading}
                    autoFocus
                  />
                  <p className="text-muted mt-sm" style={{ fontSize: 'var(--font-size-sm)' }}>
                    Where should the QR code redirect to?
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="label">
                    Label (Optional)
                  </label>
                  <input
                    id="label"
                    type="text"
                    className="form-input"
                    placeholder="e.g., Business Card, Menu, Product Link"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    disabled={loading}
                  />
                  <p className="text-muted mt-sm" style={{ fontSize: 'var(--font-size-sm)' }}>
                    A friendly name to help you identify this QR code
                  </p>
                </div>

                <div style={{ marginTop: 'var(--spacing-xl)' }}>
                  <button
                    type="submit"
                    className="btn btn--primary btn--block btn--lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner"></span>
                        Generating QR Code...
                      </>
                    ) : (
                      'Generate QR Code'
                    )}
                  </button>
                </div>
              </form>

              {/* Info Box */}
              <div
                style={{
                  marginTop: 'var(--spacing-xl)',
                  padding: 'var(--spacing-md)',
                  background: 'var(--color-accent-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-sm)'
                }}
              >
                <strong style={{ color: 'var(--color-accent)' }}>💡 Dynamic QR Codes</strong>
                <p className="text-muted mt-sm">
                  Unlike static QR codes, you can change where this QR code redirects
                  at any time — without needing to print a new code.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default CreateQR;
