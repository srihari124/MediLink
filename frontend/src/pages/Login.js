
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:4004/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      login(token);
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-vh-100 d-flex align-items-center" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-5 col-md-7">
              <div className="modern-card p-5" style={{ animation: 'fadeInUp 0.8s ease' }}>
                {/* Header */}
                <div className="text-center mb-5">
                  {/* <div
                      className="d-inline-flex align-items-center justify-content-center mb-4"
                      style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        borderRadius: '20px'
                      }}
                  >
                    <i className="bi bi-hospital text-white" style={{ fontSize: '2rem' }}></i>
                  </div> */}
                  <h2 className="fw-bold text-gradient mb-2">Welcome Back!</h2>
                  <p className="text-muted">Sign in to access your medical equipment rental account</p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="alert alert-danger rounded-3 border-0" role="alert">
                      <i className="bi bi-exclamation-circle me-2"></i>
                      {error}
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark">
                      <i className="bi bi-envelope me-2 text-primary"></i>
                      Email Address
                    </label>
                    <input
                        type="email"
                        className="modern-form-control form-control"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ fontSize: '16px', padding: '15px' }}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark">
                      <i className="bi bi-lock me-2 text-primary"></i>
                      Password
                    </label>
                    <div className="position-relative">
                      <input
                          type={showPassword ? 'text' : 'password'}
                          className="modern-form-control form-control"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          style={{ fontSize: '16px', padding: '15px', paddingRight: '50px' }}
                      />
                      <button
                          type="button"
                          className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-muted"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ border: 'none', background: 'none' }}
                      >
                        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <button
                        type="submit"
                        className="btn btn-gradient-primary w-100 py-3 fw-semibold"
                        disabled={loading}
                        style={{ fontSize: '16px' }}
                    >
                      {loading ? (
                          <>
                        <span className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </span>
                            Signing in...
                          </>
                      ) : (
                          <>
                            <i className="bi bi-box-arrow-in-right me-2"></i>
                            Sign In
                          </>
                      )}
                    </button>
                  </div>

                  <div className="text-center">
                    <p className="text-muted mb-3">
                      Don't have an account?{' '}
                      <Link
                          to="/register"
                          className="text-decoration-none fw-semibold"
                          style={{ color: '#667eea' }}
                      >
                        Create Account
                      </Link>
                    </p>

                    <div className="d-flex align-items-center justify-content-center gap-3 mt-4">
                      <div style={{ height: '1px', background: '#e2e8f0', flex: 1 }}></div>
                      <small className="text-muted">Secure Login</small>
                      <div style={{ height: '1px', background: '#e2e8f0', flex: 1 }}></div>
                    </div>

                    <div className="d-flex justify-content-center gap-3 mt-3">
                      <div className="d-flex align-items-center text-muted">
                        <i className="bi bi-shield-check me-1 text-success"></i>
                        <small>SSL Encrypted</small>
                      </div>
                      <div className="d-flex align-items-center text-muted">
                        <i className="bi bi-lock me-1 text-success"></i>
                        <small>Secure</small>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Back to Home */}
              <div className="text-center mt-4">
                <Link
                    to="/"
                    className="text-white text-decoration-none"
                    style={{ opacity: 0.8 }}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Login;