import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../pages/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper function to get user display name
  const getUserDisplayName = (user) => {
    if (!user) return 'User';
    
    // Debug: Log what we're working with
    console.log('Navbar getUserDisplayName - user object:', user);
    console.log('Name field:', user.name);
    console.log('Username field:', user.username);
    console.log('Email field:', user.email);
    
    // Use name if available
    if (user.name) return user.name;
    if (user.username) return user.username;
    if (user.email) {
      const emailName = user.email.split('@')[0];
      return emailName
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    }
    
    return 'User';
  };

  const getUserRole = (user) => {
    if (!user) return 'User';
    
    const role = user.role || user.userRole || user.user_role || user.authorities?.[0];
    
    if (role === 'HOSPITAL_ADMIN' || role === 'ADMIN') {
      return 'Admin';
    } else if (role === 'USER' || role === 'RENTER') {
      return 'Renter';
    }
    
    return 'User';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, children, icon, onClick }) => (
    <Link
      to={to}
      className={`nav-link px-3 py-2 rounded-3 fw-semibold position-relative ${
        isActive(to) ? 'active-nav-link' : 'text-dark'
      }`}
      onClick={onClick || (() => setIsMobileMenuOpen(false))}
      style={{
        transition: 'all 0.3s ease',
        textDecoration: 'none'
      }}
    >
      {icon && <i className={`bi ${icon} me-2`}></i>}
      {children}
      {isActive(to) && (
        <span 
          className="position-absolute bottom-0 start-50 translate-middle-x"
          style={{
            width: '6px',
            height: '6px',
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            borderRadius: '50%'
          }}
        ></span>
      )}
    </Link>
  );

  return (
    <>
      <nav 
        className={`navbar navbar-expand-lg fixed-top transition-all ${
          isScrolled ? 'navbar-scrolled' : 'navbar-transparent'
        }`}
        style={{
          background: isScrolled 
            ? 'rgba(255, 255, 255, 0.95)' 
            : 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderBottom: isScrolled ? '1px solid rgba(0,0,0,0.1)' : 'none',
          transition: 'all 0.3s ease',
          zIndex: 1050
        }}
      >
        <div className="container">
          {/* Brand Logo */}
          <Link 
            className="navbar-brand d-flex align-items-center text-decoration-none"
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {/* <div 
              className="d-flex align-items-center justify-content-center me-3"
              style={{
                width: '45px',
                height: '45px',
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                borderRadius: '12px',
                transition: 'all 0.3s ease'
              }}
            >
              <i className="bi bi-hospital text-white" style={{ fontSize: '1.3rem' }}></i>
            </div> */}
            <div>
              <span 
                className="fw-bold fs-4"
                style={{
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                MediLink
              </span>
              <div className="small text-muted" style={{ fontSize: '0.7rem', marginTop: '-2px' }}>
                Medical Rental Platform
              </div>
            </div>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            className="navbar-toggler border-0 p-2 rounded-3"
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              transition: 'all 0.3s ease'
            }}
          >
            <span className="text-white">
              <i className={`bi ${isMobileMenuOpen ? 'bi-x-lg' : 'bi-list'}`} style={{ fontSize: '1.2rem' }}></i>
            </span>
          </button>

          {/* Navigation Menu */}
          <div className={`collapse navbar-collapse ${isMobileMenuOpen ? 'show' : ''}`}>
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
              <li className="nav-item mx-1">
                <NavLink to="/" icon="bi-house">Home</NavLink>
              </li>
              <li className="nav-item mx-1">
                <NavLink to="/search" icon="bi-search">Search Equipment</NavLink>
              </li>
              {user && (
                <>
                  {getUserRole(user) === 'Admin' && (
                    <li className="nav-item mx-1">
                      <NavLink to="/dashboard" icon="bi-speedometer2">Dashboard</NavLink>
                    </li>
                  )}
                  <li className="nav-item mx-1">
                    <NavLink to="/bookings" icon="bi-calendar-check">
                      {getUserRole(user) === 'Admin' ? 'Manage Bookings' : 'My Bookings'}
                    </NavLink>
                  </li>
                </>
              )}
            </ul>

            {/* User Actions */}
            <div className="d-flex align-items-center gap-3">
              {user ? (
                <div className="d-flex align-items-center gap-3">
                  {/* User Info */}
                  <div className="d-flex align-items-center">
                    {/* <div 
                      className="d-flex align-items-center justify-content-center me-2"
                      style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(45deg, #28a745, #20c997)',
                        borderRadius: '50%'
                      }}
                    >
                      <i className="bi bi-person text-white"></i>
                    </div> */}
                    <div className="d-none d-md-block">
                      {/* <div className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>
                        {getUserDisplayName(user)}
                      </div> */}
                      {/* <div className="small text-muted" style={{ fontSize: '0.75rem', marginTop: '-2px' }}>
                        {getUserRole(user)}
                      </div> */}
                    </div>
                  </div>

                  {/* Logout Button */}
                  <button
                    className="btn border-0 rounded-3 px-3 py-2"
                    onClick={handleLogout}
                    style={{
                      background: 'linear-gradient(45deg, #dc3545, #c82333)',
                      color: 'white',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <i className="bi bi-box-arrow-right me-1"></i>
                    <span className="d-none d-sm-inline">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="d-flex gap-2">
                  <Link
                    to="/login"
                    className="btn btn-outline-primary border-2 rounded-3 px-4 py-2 fw-semibold"
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                      borderColor: '#667eea',
                      color: '#667eea',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <i className="bi bi-box-arrow-in-right me-1"></i>
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn border-0 rounded-3 px-4 py-2 fw-semibold text-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <i className="bi bi-person-plus me-1"></i>
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu-overlay d-lg-none"
          style={{
            position: 'fixed',
            top: '80px',
            left: 0,
            right: 0,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            zIndex: 1049,
            padding: '2rem',
            borderTop: '1px solid rgba(0,0,0,0.1)',
            animation: 'slideDown 0.3s ease'
          }}
        >
          <div className="d-flex flex-column gap-3">
            <NavLink to="/" icon="bi-house">Home</NavLink>
            <NavLink to="/search" icon="bi-search">Search Equipment</NavLink>
            {user && (
              <>
                {getUserRole(user) === 'Admin' && (
                  <NavLink to="/dashboard" icon="bi-speedometer2">Dashboard</NavLink>
                )}
                <NavLink to="/bookings" icon="bi-calendar-check">
                  {getUserRole(user) === 'Admin' ? 'Manage Bookings' : 'My Bookings'}
                </NavLink>
              </>
            )}
            
            {/* Mobile User Actions */}
            <div className="border-top pt-3 mt-3">
              {user ? (
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex align-items-center">
                    <div 
                      className="d-flex align-items-center justify-content-center me-3"
                      style={{
                        width: '50px',
                        height: '50px',
                        background: 'linear-gradient(45deg, #28a745, #20c997)',
                        borderRadius: '50%'
                      }}
                    >
                      <i className="bi bi-person text-white" style={{ fontSize: '1.2rem' }}></i>
                    </div>
                    <div>
                      <div className="fw-semibold text-dark">{getUserDisplayName(user)}</div>
                      <div className="small text-muted">
                        {getUserRole(user)}
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn border-0 rounded-3 w-100 py-3"
                    onClick={handleLogout}
                    style={{
                      background: 'linear-gradient(45deg, #dc3545, #c82333)',
                      color: 'white'
                    }}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </button>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  <Link
                    to="/login"
                    className="btn btn-outline-primary border-2 rounded-3 py-3 fw-semibold"
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                      borderColor: '#667eea',
                      color: '#667eea'
                    }}
                  >
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Login to Account
                  </Link>
                  <Link
                    to="/register"
                    className="btn border-0 rounded-3 py-3 fw-semibold text-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                      background: 'linear-gradient(45deg, #667eea, #764ba2)'
                    }}
                  >
                    <i className="bi bi-person-plus me-2"></i>
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add some CSS for better styling */}
      <style jsx>{`
        .navbar {
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
        }
        
        .navbar-scrolled {
          box-shadow: 0 2px 30px rgba(0, 0, 0, 0.15);
        }
        
        .active-nav-link {
          background: linear-gradient(45deg, #667eea, #764ba2) !important;
          color: white !important;
        }
        
        .nav-link:hover {
          background: rgba(102, 126, 234, 0.1) !important;
          color: #667eea !important;
          transform: translateY(-1px);
        }
        
        .active-nav-link:hover {
          background: linear-gradient(45deg, #5a6fd8, #6a4190) !important;
          color: white !important;
        }
        
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        
        .navbar-brand:hover .d-flex {
          transform: scale(1.05);
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 991.98px) {
          .navbar-collapse {
            display: none;
          }
          .navbar-collapse.show {
            display: block;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;