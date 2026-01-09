
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'RENTER'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:4004/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      login(token);
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div
          className="min-vh-100 d-flex align-items-center"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            paddingTop: '80px',  // Add padding to account for the fixed navbar
            paddingBottom: '30px' // Add some bottom padding for better spacing
          }}
      >
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8">
              <div className="modern-card p-5" style={{ animation: 'fadeInUp 0.8s ease' }}>
                {/* Header */}
                <div className="text-center mb-5">
                  {/*<div*/}
                  {/*    className="d-inline-flex align-items-center justify-content-center mb-4"*/}
                  {/*    style={{*/}
                  {/*      width: '80px',*/}
                  {/*      height: '80px',*/}
                  {/*      background: 'linear-gradient(45deg, #667eea, #764ba2)',*/}
                  {/*      borderRadius: '20px'*/}
                  {/*    }}*/}
                  {/*>*/}
                  {/*  <i className="bi bi-person-plus text-white" style={{ fontSize: '2rem' }}></i>*/}
                  {/*</div>*/}
                  <h2 className="fw-bold text-gradient mb-2">Create Account</h2>
                  <p className="text-muted">Join MedEquip to start renting medical equipment</p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="alert alert-danger rounded-3 border-0" role="alert">
                      <i className="bi bi-exclamation-circle me-2"></i>
                      {error}
                    </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleRegister}>
                  <div className="row g-4">
                    <div className="col-12">
                      <label className="form-label fw-semibold text-dark">
                        <i className="bi bi-person me-2 text-primary"></i>
                        Full Name
                      </label>
                      <input
                          type="text"
                          name="name"
                          className="modern-form-control form-control"
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          style={{ fontSize: '16px', padding: '15px' }}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold text-dark">
                        <i className="bi bi-envelope me-2 text-primary"></i>
                        Email Address
                      </label>
                      <input
                          type="email"
                          name="email"
                          className="modern-form-control form-control"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          style={{ fontSize: '16px', padding: '15px' }}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark">
                        <i className="bi bi-lock me-2 text-primary"></i>
                        Password
                      </label>
                      <div className="position-relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            className="modern-form-control form-control"
                            placeholder="Create password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            style={{ fontSize: '16px', padding: '15px', paddingRight: '50px' }}
                        />
                        <button
                            type="button"
                            className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-muted"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                          <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </button>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark">
                        <i className="bi bi-lock-fill me-2 text-primary"></i>
                        Confirm Password
                      </label>
                      <div className="position-relative">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            className="modern-form-control form-control"
                            placeholder="Confirm password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            style={{ fontSize: '16px', padding: '15px', paddingRight: '50px' }}
                        />
                        <button
                            type="button"
                            className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-muted"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </button>
                      </div>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold text-dark">
                        <i className="bi bi-person-badge me-2 text-primary"></i>
                        Account Type
                      </label>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="modern-card p-3 cursor-pointer" style={{
                            border: formData.role === 'RENTER' ? '2px solid #667eea' : '2px solid #e2e8f0',
                            background: formData.role === 'RENTER' ? 'rgba(102, 126, 234, 0.1)' : 'white'
                          }}
                               onClick={() => setFormData({...formData, role: 'RENTER'})}>
                            <input
                                type="radio"
                                name="role"
                                value="RENTER"
                                checked={formData.role === 'RENTER'}
                                onChange={handleChange}
                                className="form-check-input me-2"
                            />
                            <div className="d-flex align-items-center">
                              <i className="bi bi-person text-primary me-3" style={{ fontSize: '1.5rem' }}></i>
                              <div>
                                <div className="fw-semibold">Medical Renter</div>
                                <small className="text-muted">Rent medical equipment</small>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="modern-card p-3 cursor-pointer" style={{
                            border: formData.role === 'HOSPITAL_ADMIN' ? '2px solid #667eea' : '2px solid #e2e8f0',
                            background: formData.role === 'HOSPITAL_ADMIN' ? 'rgba(102, 126, 234, 0.1)' : 'white'
                          }}
                               onClick={() => setFormData({...formData, role: 'HOSPITAL_ADMIN'})}>
                            <input
                                type="radio"
                                name="role"
                                value="HOSPITAL_ADMIN"
                                checked={formData.role === 'HOSPITAL_ADMIN'}
                                onChange={handleChange}
                                className="form-check-input me-2"
                            />
                            <div className="d-flex align-items-center">
                              <i className="bi bi-building text-primary me-3" style={{ fontSize: '1.5rem' }}></i>
                              <div>
                                <div className="fw-semibold">Hospital Admin</div>
                                <small className="text-muted">Manage hospital equipment</small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-12 mt-4">
                      <button
                          type="submit"
                          className="btn btn-gradient-primary w-100 py-3"
                          disabled={loading}
                      >
                        {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Creating Account...
                            </>
                        ) : (
                            <>
                              <i className="bi bi-person-plus-fill me-2"></i>
                              Create Account
                            </>
                        )}
                      </button>
                    </div>

                    <div className="col-12 text-center mt-2">
                      <p className="mb-0 text-muted">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary fw-semibold text-decoration-none">
                          Login Here
                        </Link>
                      </p>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Register;