import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Pin, Mail, Lock, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  // Instant demo account filler
  const handleFillDemo = () => {
    setEmail('demo@corkboard.app');
    setPassword('DemoPass123!');
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const result = await login(email, password);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setIsSubmitting(false);
      const newErr = result.errors || {};
      newErr.general = result.message || 'Invalid email or password. Please check your credentials.';
      setErrors(newErr);
    }
  };

  return (
    <div className="auth-viewport">
      <div className="notebook-binder">
        <div className="notebook-page">
          {/* Decorative Vintage Stamp */}
          <div className="notebook-stamp">
            <span>PINBOARD</span>
            <span>★ AUTH ★</span>
            <span>2026</span>
          </div>

          {/* Notebook Header */}
          <div className="notebook-header">
            <div className="notebook-logo-badge">
              <Pin size={18} color="#d9483b" />
              <span>PinBoard Daily</span>
            </div>
            <h1 className="notebook-title">Open Your Board</h1>
            <p className="notebook-subtitle">
              Sign in to access your pinned tasks and productivity wall.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="notebook-form" noValidate>
            {errors.general && (
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#fde8e5',
                  border: '1px solid #f39a8a',
                  borderRadius: '6px',
                  color: '#8b1e15',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span className="handwritten" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                  ✎ {errors.general}
                </span>
              </div>
            )}
            {/* Email Field */}
            <div className="notebook-field">
              <label className="notebook-label" htmlFor="login-email">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} /> Email Address
                </span>
              </label>
              <input
                id="login-email"
                type="email"
                className={`notebook-input ${errors.email ? 'has-error' : ''}`}
                placeholder="alex@corkboard.app"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
                autoComplete="email"
                required
              />
              {errors.email && (
                <div className="field-error-note">
                  <span>✎ {errors.email}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="notebook-field">
              <label className="notebook-label" htmlFor="login-password">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={14} /> Password
                </span>
              </label>
              <input
                id="login-password"
                type="password"
                className={`notebook-input ${errors.password ? 'has-error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
                autoComplete="current-password"
                required
              />
              {errors.password && (
                <div className="field-error-note">
                  <span>✎ {errors.password}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary-wood"
              style={{ width: '100%', marginTop: '6px' }}
              disabled={isSubmitting}
              id="btn-login-submit"
            >
              <span>{isSubmitting ? 'Unlocking Notebook...' : 'Enter Workspace'}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Demo Fill Helper Card */}
          <div className="demo-fill-card">
            <div>
              <strong>Quick Demo Mode:</strong>
              <div style={{ opacity: 0.85, fontSize: '0.78rem' }}>
                demo@corkboard.app / DemoPass123!
              </div>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              id="btn-fill-demo"
            >
              Fill Demo
            </button>
          </div>

          {/* Switch to Register */}
          <div className="auth-switch-text">
            Don&apos;t have a pinned board yet?{' '}
            <Link to="/register" id="link-go-to-register">
              Create your account &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
