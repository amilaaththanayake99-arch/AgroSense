import React, { useState } from 'react';
import { X, LogIn, UserPlus } from 'lucide-react';
import { loginUser, registerUser } from '../../services/api';
import './AuthModals.css';

export const LoginModal = ({ onClose, onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email && password) {
      setLoading(true);
      setError(null);
      try {
        const response = await loginUser({ email, password });
        onLogin(response.user); // Pass the user object
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="auth-modal-backdrop fade-in" onClick={onClose}>
      <div className="auth-modal-card slide-up" onClick={e => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose}><X size={20} /></button>
        
        <div className="auth-header">
          <div className="auth-icon-wrapper"><LogIn size={24} /></div>
          <h2>Welcome Back</h2>
          <p>Sign in to continue to AgriSense</p>
        </div>

        {error && <div className="auth-error-message" style={{color: 'red', textAlign: 'center', marginBottom: '1rem', fontSize: '0.9rem'}}>{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email or Username</label>
            <input 
              type="text" 
              placeholder="Enter your email or 'admin'" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="Enter your password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          {onSwitchToRegister && (
            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#666' }}>
              Don't have an account?{' '}
              <button 
                type="button" 
                onClick={onSwitchToRegister}
                style={{ background: 'none', border: 'none', color: '#16a34a', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Create Account
              </button>
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export const RegisterModal = ({ onClose, onRegister, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (name && phone && email && password) {
      setLoading(true);
      setError(null);
      try {
        const response = await registerUser({ name, phone, email, password });
        setSuccess("Account created successfully! Please sign in now.");
        setTimeout(() => {
          onRegister(response.user);
        }, 1200);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="auth-modal-backdrop fade-in" onClick={onClose}>
      <div className="auth-modal-card slide-up" onClick={e => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose}><X size={20} /></button>
        
        <div className="auth-header">
          <div className="auth-icon-wrapper register-icon"><UserPlus size={24} /></div>
          <h2>Create Account</h2>
          <p>Join the AgriSense smart farming community</p>
        </div>

        {error && <div className="auth-error-message" style={{color: 'red', textAlign: 'center', marginBottom: '1rem', fontSize: '0.9rem'}}>{error}</div>}
        {success && <div className="auth-success-message" style={{color: '#16a34a', fontWeight: 600, textAlign: 'center', marginBottom: '1rem', fontSize: '0.95rem'}}>{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              placeholder="e.g. Amila Bandara" 
              value={name}
              onChange={e => setName(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="tel" 
              placeholder="e.g. +94 77 123 4567" 
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="Create a strong password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="auth-submit-btn register-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          {onSwitchToLogin && (
            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#666' }}>
              Already have an account?{' '}
              <button 
                type="button" 
                onClick={onSwitchToLogin}
                style={{ background: 'none', border: 'none', color: '#16a34a', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Sign In
              </button>
            </p>
          )}
        </form>
      </div>
    </div>
  );
};
