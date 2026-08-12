import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ShieldAlert, ArrowRight } from 'lucide-react';
import ChipVisualization from './ChipVisualization';
import { api } from '../services/api';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (api.isAuthenticated()) {
      const user = api.getUser();
      if (user?.role === 'ADMIN') {
        navigate('/admin/dashboard');
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.login(username, password);
      if (res.ok) {
        const role = res.data.role;
        
        // Strict Role Check: Only ADMIN allowed
        if (role !== 'ADMIN') {
          // Clear session immediately so non-admin user is not authenticated
          await api.logout();
          setError('Access Denied: This login portal is restricted to platform administrators only.');
          setLoading(false);
          return;
        }

        navigate('/admin/dashboard');
      } else {
        setError(res.data.message || 'Invalid administrator credentials');
      }
    } catch {
      setError('Could not connect to administrator authentication service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-split-wrapper">
      {/* ── Left Panel: Chip Visualization ── */}
      <div className="admin-chip-panel">
        <ChipVisualization />
        <div className="admin-chip-brand">
          <span className="admin-chip-brand-name">Sarees For Naaris</span>
          <span className="admin-chip-brand-tag">Infrastructure Control</span>
        </div>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div className="admin-form-panel">
        <div className="admin-glass-card">
          <p className="admin-eyebrow">SECURE CONSOLE ACCESS</p>
          <h1 className="admin-heading">Administrator Sign In</h1>
          <p className="admin-subheading">Platform Superadmin Control Center</p>

          {error && (
            <div className="admin-alert-error">
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="admin-form">
            <div className="admin-field">
              <label className="admin-label" htmlFor="admin-username">Username / Email</label>
              <div className="admin-input-wrap">
                <Mail className="admin-input-icon" size={16} />
                <input
                  id="admin-username"
                  type="text"
                  className="admin-input"
                  placeholder="admin@naaris.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="admin-password">Password</label>
              <div className="admin-input-wrap">
                <Lock className="admin-input-icon" size={16} />
                <input
                  id="admin-password"
                  type="password"
                  className="admin-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button type="submit" className="admin-submit-btn" disabled={loading}>
              {loading ? (
                <span className="admin-spinner" />
              ) : (
                <>
                  Authenticate
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="admin-footer-note">Authorized Operations Personnel Only</p>
        </div>
      </div>
    </div>
  );
}
