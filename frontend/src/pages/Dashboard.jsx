import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { qrApi, authApi } from '../services/api';

/**
 * Dashboard Page Component
 * Displays user's QR codes with stats and management options
 */
function Dashboard() {
  const navigate = useNavigate();
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  
  // Edit modal state
  const [editModal, setEditModal] = useState({ open: false, qr: null });
  const [editDestination, setEditDestination] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Fetch QR codes on mount
  useEffect(() => {
    fetchQRCodes();
  }, []);

  const fetchQRCodes = async () => {
    try {
      setLoading(true);
      const { qrCodes } = await qrApi.listQRCodes();
      setQrCodes(qrCodes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authApi.logout();
    navigate('/');
  };

  const handleCopyUrl = (qrId) => {
    const url = qrApi.getRedirectUrl(qrId);
    navigator.clipboard.writeText(url);
    showToast('URL copied to clipboard!', 'success');
  };

  const handleDownload = (qrUrl, label) => {
    // Open QR image in new tab (in production, would trigger download)
    window.open(qrUrl, '_blank');
    showToast('Opening QR code image...', 'success');
  };

  const handleEditClick = (qr) => {
    setEditModal({ open: true, qr });
    setEditDestination(qr.destination);
  };

  const handleEditSave = async () => {
    if (!editDestination) return;
    
    try {
      setEditLoading(true);
      await qrApi.updateDestination(editModal.qr.qrId, editDestination);
      setEditModal({ open: false, qr: null });
      showToast('Destination updated successfully!', 'success');
      fetchQRCodes(); // Refresh list
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (qrId) => {
    if (!confirm('Are you sure you want to delete this QR code?')) return;
    
    try {
      await qrApi.deleteQR(qrId);
      showToast('QR code deleted', 'success');
      fetchQRCodes();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="container header__inner">
          <div className="header__logo">
            <div className="header__logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </div>
            <span>QR Dynamic</span>
          </div>
          <nav className="header__nav">
            <Link to="/create" className="btn btn--primary">
              + Create QR
            </Link>
            <button onClick={handleLogout} className="btn btn--ghost">
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="page">
        <div className="container">
          <h1 style={{ marginBottom: 'var(--spacing-lg)' }}>Dashboard</h1>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card__value">{qrCodes.length}</div>
              <div className="stat-card__label">Total QR Codes</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__value" style={{ color: 'var(--color-success)' }}>
                {qrCodes.length}
              </div>
              <div className="stat-card__label">Active</div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="empty-state">
              <div className="spinner" style={{ width: 40, height: 40, margin: '0 auto' }}></div>
              <p className="mt-md">Loading your QR codes...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="empty-state">
              <div className="empty-state__icon">⚠️</div>
              <div className="empty-state__title">Error loading QR codes</div>
              <p className="empty-state__description">{error}</p>
              <button onClick={fetchQRCodes} className="btn btn--primary">
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && qrCodes.length === 0 && (
            <div className="empty-state">
              <div className="empty-state__icon">📱</div>
              <div className="empty-state__title">No QR codes yet</div>
              <p className="empty-state__description">
                Create your first dynamic QR code to get started
              </p>
              <Link to="/create" className="btn btn--primary btn--lg">
                Create Your First QR Code
              </Link>
            </div>
          )}

          {/* QR Code Grid */}
          {!loading && !error && qrCodes.length > 0 && (
            <div className="qr-grid">
              {qrCodes.map((qr) => (
                <div key={qr.qrId} className="qr-card">
                  <div className="qr-card__image">
                    <img src={qr.qrUrl} alt={qr.label} />
                  </div>
                  <div className="qr-card__content">
                    <div className="qr-card__label">{qr.label}</div>
                    <div className="qr-card__url">{qr.destination}</div>
                    <div className="qr-card__meta">
                      Created {formatDate(qr.createdAt)}
                    </div>
                  </div>
                  <div className="qr-card__actions">
                    <button
                      onClick={() => handleCopyUrl(qr.qrId)}
                      className="btn btn--secondary btn--sm"
                      title="Copy URL"
                    >
                      📋 Copy
                    </button>
                    <button
                      onClick={() => handleDownload(qr.qrUrl, qr.label)}
                      className="btn btn--secondary btn--sm"
                      title="Download"
                    >
                      ⬇️ Download
                    </button>
                    <button
                      onClick={() => handleEditClick(qr)}
                      className="btn btn--ghost btn--sm"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(qr.qrId)}
                      className="btn btn--ghost btn--sm"
                      title="Delete"
                      style={{ color: 'var(--color-error)' }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {editModal.open && (
        <div className="modal-overlay" onClick={() => setEditModal({ open: false, qr: null })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h2 className="modal__title">Edit Destination</h2>
              <button
                onClick={() => setEditModal({ open: false, qr: null })}
                className="btn btn--ghost btn--sm"
              >
                ✕
              </button>
            </div>
            <div className="modal__body">
              <p className="text-muted mb-md">
                Update the destination URL for <strong>{editModal.qr?.label}</strong>.
                The QR code image will remain the same.
              </p>
              <div className="form-group">
                <label className="form-label">New Destination URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://example.com"
                  value={editDestination}
                  onChange={(e) => setEditDestination(e.target.value)}
                  disabled={editLoading}
                />
              </div>
            </div>
            <div className="modal__footer">
              <button
                onClick={() => setEditModal({ open: false, qr: null })}
                className="btn btn--secondary"
                disabled={editLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="btn btn--primary"
                disabled={editLoading || !editDestination}
              >
                {editLoading ? (
                  <>
                    <span className="spinner"></span>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast toast--${toast.type}`}>
          {toast.message}
        </div>
      )}
    </>
  );
}

export default Dashboard;
