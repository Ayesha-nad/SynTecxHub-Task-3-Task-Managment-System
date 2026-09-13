import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pin, User, Mail, Lock, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Please tell us your name';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (!password) {
      newErrors.password = 'Please choose a password';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const result = await register(name.trim(), email.trim(), password);

    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setIsSubmitting(false);
      const newErr = result.errors || {};
      newErr.general = result.message || 'Failed to create account. Please check your inputs.';
      setErrors(newErr);
    }
  };

  return (
    <div className="auth-viewport">
      <div className="notebook-binder">
        <div className="notebook-page">
          {/* Decorative Vintage Stamp */}
          <div className="notebook-stamp">
            <span>NEW</span>
            <span>★ BOARD ★</span>
            <span>SETUP</span>
          </div>

          {/* Notebook Header */}
          <div className="notebook-header">
            <div className="notebook-logo-badge">
              <Pin size={18} color="#d9483b" />
              <span>PinBoard Daily</span>
            </div>
            <h1 className="notebook-title">Get Your Board</h1>
            <p className="notebook-subtitle">
              Start pinning your notes, deadlines, and daily flow.
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
            {/* Full Name */}
            <div className="notebook-field">
              <label className="notebook-label" htmlFor="register-name">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} /> Your Name
                </span>
              </label>
              <input
                id="register-name"
                type="text"
                className={`notebook-input ${errors.name ? 'has-error' : ''}`}
                placeholder="Alex Morgan"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: null });
                }}
                autoComplete="name"
                required
              />
              {errors.name && (
                <div className="field-error-note">
                  <span>✎ {errors.name}</span>
                </div>
              )}
            </div>

            {/* Email Address */}
            <div className="notebook-field">
              <label className="notebook-label" htmlFor="register-email">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} /> Email Address
                </span>
              </label>
              <input
                id="register-email"
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

            {/* Password */}
            <div className="notebook-field">
              <label className="notebook-label" htmlFor="register-password">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={14} /> Password (min 6 characters)
                </span>
              </label>
              <input
                id="register-password"
                type="password"
                className={`notebook-input ${errors.password ? 'has-error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
                autoComplete="new-password"
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
              id="btn-register-submit"
            >
              <span>{isSubmitting ? 'Pinning your workspace...' : 'Create My Board'}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Switch to Login */}
          <div className="auth-switch-text">
            Already have a board setup?{' '}
            <Link to="/login" id="link-go-to-login">
              Sign in to your notebook &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
