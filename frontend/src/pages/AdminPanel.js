import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/api';
import '../styles/AdminPanel.css';

function AdminPanel() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('whitelist');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Whitelist state
  const [whitelist, setWhitelist] = useState([]);
  const [whitelistStats, setWhitelistStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Manual add form
  const [manualAdd, setManualAdd] = useState({ governorId: '', governorName: '' });

  // Users state
  const [users, setUsers] = useState([]);

  useEffect(() => {
    document.title = '3584 Commanders - Admin Panel';
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const loadWhitelist = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        adminService.getWhitelist(currentPage, 50, searchQuery),
        adminService.getWhitelistStats()
      ]);
      setWhitelist(listRes.data.governors || []);
      setTotalPages(listRes.data.totalPages || 1);
      setWhitelistStats(statsRes.data.stats);
    } catch (err) {
      showMessage('error', 'Failed to load whitelist');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers();
      setUsers(res.data.users || []);
    } catch (err) {
      showMessage('error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'whitelist') {
      loadWhitelist();
    } else if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab, loadWhitelist, loadUsers]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await adminService.uploadWhitelist(file);
      showMessage('success', res.data.message);
      loadWhitelist();
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Failed to upload whitelist');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleManualAdd = async (e) => {
    e.preventDefault();
    if (!manualAdd.governorId) {
      showMessage('error', 'Governor ID is required');
      return;
    }

    try {
      await adminService.addToWhitelist(manualAdd.governorId, manualAdd.governorName);
      showMessage('success', 'Governor added to whitelist');
      setManualAdd({ governorId: '', governorName: '' });
      loadWhitelist();
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Failed to add governor');
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Remove this governor from the whitelist?')) return;

    try {
      await adminService.removeFromWhitelist(id);
      showMessage('success', 'Governor removed from whitelist');
      loadWhitelist();
    } catch (err) {
      showMessage('error', 'Failed to remove governor');
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    return num.toLocaleString();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="admin-panel">
      <button className="back-btn" onClick={() => navigate('/')}>
        &larr; Back to Dashboard
      </button>

      <h1>Admin Panel</h1>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'whitelist' ? 'active' : ''}`}
          onClick={() => setActiveTab('whitelist')}
        >
          Whitelist Management
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Registered Users
        </button>
      </div>

      <div className="admin-content">
        {/* Whitelist Tab */}
        {activeTab === 'whitelist' && (
          <div className="whitelist-section">
            {/* Stats */}
            {whitelistStats && (
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-value">{formatNumber(whitelistStats.totalVerified)}</span>
                  <span className="stat-label">Verified Members</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{formatNumber(whitelistStats.registeredVerified)}</span>
                  <span className="stat-label">Have Registered</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{formatNumber(whitelistStats.unregisteredVerified)}</span>
                  <span className="stat-label">Not Yet Registered</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{formatNumber(whitelistStats.totalUsers)}</span>
                  <span className="stat-label">Total Users</span>
                </div>
              </div>
            )}

            {/* Upload Section */}
            <div className="upload-section">
              <h3>Upload Member List</h3>
              <p className="help-text">
                Upload an Excel file (.xlsx) containing KD 3584 member data.
                The file should have columns: Governor ID, Governor Name
              </p>
              <div className="upload-controls">
                <label className="upload-btn">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  {uploading ? 'Uploading...' : 'Choose Excel File'}
                </label>
                {whitelistStats?.lastUploadDate && (
                  <span className="last-upload">
                    Last upload: {formatDate(whitelistStats.lastUploadDate)}
                  </span>
                )}
              </div>
            </div>

            {/* Manual Add Section */}
            <div className="manual-add-section">
              <h3>Manually Add Governor</h3>
              <form onSubmit={handleManualAdd} className="manual-add-form">
                <input
                  type="text"
                  placeholder="Governor ID"
                  value={manualAdd.governorId}
                  onChange={(e) => setManualAdd({ ...manualAdd, governorId: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Governor Name (optional)"
                  value={manualAdd.governorName}
                  onChange={(e) => setManualAdd({ ...manualAdd, governorName: e.target.value })}
                />
                <button type="submit" className="btn-add">Add</button>
              </form>
            </div>

            {/* Search */}
            <div className="search-section">
              <input
                type="text"
                placeholder="Search by ID or name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Whitelist Table */}
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <>
                <table className="whitelist-table">
                  <thead>
                    <tr>
                      <th>Governor ID</th>
                      <th>Name</th>
                      <th>Power</th>
                      <th>Alliance</th>
                      <th>Kill Points</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {whitelist.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="no-data">
                          No verified governors found. Upload an Excel file to add members.
                        </td>
                      </tr>
                    ) : (
                      whitelist.map((gov) => (
                        <tr key={gov._id}>
                          <td className="gov-id">{gov.visibleGovernorId}</td>
                          <td>{gov.governorName}</td>
                          <td>{formatNumber(gov.power)}</td>
                          <td>{gov.allianceTag || '-'}</td>
                          <td>{formatNumber(gov.killPoints)}</td>
                          <td>
                            <button
                              className="btn-remove"
                              onClick={() => handleRemove(gov._id)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                    >
                      Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="users-section">
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Governor ID</th>
                    <th>Governor Name</th>
                    <th>Role</th>
                    <th>Verified</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="no-data">No registered users found.</td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user._id}>
                        <td className="gov-id">{user.visibleGovernorId}</td>
                        <td>{user.governorId?.name || '-'}</td>
                        <td>
                          <span className={`role-badge ${user.role}`}>{user.role}</span>
                        </td>
                        <td>
                          <span className={`verified-badge ${user.isVerified ? 'verified' : 'unverified'}`}>
                            {user.isVerified ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td>{formatDate(user.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
