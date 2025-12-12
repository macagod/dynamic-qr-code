import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';

/**
 * Login Page Component
 * Handles user authentication (login/signup)
 */
function Login() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        await authApi.signUp(email, password);
        setSuccess('Account created! Please log in.');
        setIsSignUp(false);
        setPassword('');
        setConfirmPassword('');
      } else {
        await authApi.login(email, password);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setSuccess('');
    setConfirmPassword('');
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-card__logo">
          <div className="header__logo" style={{ justifyContent: 'center' }}>
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
        </div>

        {/* Title */}
        <h1 className="auth-card__title text-center">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p className="auth-card__subtitle text-center">
          {isSignUp
            ? 'Sign up to start creating dynamic QR codes'
            : 'Log in to manage your QR codes'}
        </p>

        {/* Error/Success Messages */}
        {error && (
          <div className="toast toast--error" style={{ position: 'relative', bottom: 'auto', right: 'auto', marginBottom: 'var(--spacing-md)' }}>
            {error}
          </div>
        )}
        {success && (
          <div className="toast toast--success" style={{ position: 'relative', bottom: 'auto', right: 'auto', marginBottom: 'var(--spacing-md)' }}>
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
            />
          </div>

          {isSignUp && (
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn--primary btn--block btn--lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                {isSignUp ? 'Creating Account...' : 'Logging in...'}
              </>
            ) : (
              isSignUp ? 'Create Account' : 'Log In'
            )}
          </button>
        </form>

        {/* Toggle Sign Up / Login */}
        <p className="auth-card__footer">
          {isSignUp ? (
            <>
              Already have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); toggleMode(); }}>
                Log in
              </a>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); toggleMode(); }}>
                Sign up
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default Login;
