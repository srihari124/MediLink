import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios';

const Home = () => {
  const { user } = useAuth();
  const [featuredEquipment, setFeaturedEquipment] = useState([]);
  const [stats, setStats] = useState({ total: 0, available: 0, locations: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedEquipment();
    fetchStats();
  }, []);

  const fetchFeaturedEquipment = async () => {
    try {
      const response = await axios.get('http://localhost:4004/api/equipments');
      setFeaturedEquipment(response.data.slice(0, 6));
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:4004/api/equipments');
      const equipment = response.data;
      const available = equipment.filter(item => item.availability).length;
      const locations = [...new Set(equipment.map(item => item.location))].length;

      setStats({
        total: equipment.length,
        available,
        locations
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: 'bi-search',
      title: 'Easy Search',
      description: 'Find medical equipment quickly with our advanced search filters',
      color: '#667eea'
    },
    {
      icon: 'bi-shield-check',
      title: 'Verified Equipment',
      description: 'All equipment is verified and maintained to highest standards',
      color: '#28a745'
    },
    {
      icon: 'bi-clock',
      title: '24/7 Support',
      description: 'Round-the-clock customer support for all your rental needs',
      color: '#ffc107'
    },
    {
      icon: 'bi-truck',
      title: 'Fast Delivery',
      description: 'Quick delivery and setup service across multiple locations',
      color: '#17a2b8'
    }
  ];

  return (
      <div className="home-page">
        {/* Hero Section */}
        <section className="hero-section py-5">
          <div className="container">
            <div className="row align-items-center min-vh-75">
              <div className="col-lg-6">
                <div className="hero-content" style={{ animation: 'fadeInUp 1s ease' }}>
                  <h1 className="display-3 fw-bold mb-4 text-white">
                    Medical Equipment
                    <span className="d-block text-warning">Rental Platform</span>
                  </h1>
                  <p className="lead mb-5 text-white-50">
                    Access high-quality medical equipment when you need it.
                    Rent from verified providers with transparent pricing and reliable service.
                  </p>
                  <div className="d-flex flex-wrap gap-3" style={{ position: 'relative', zIndex: 10 }}>
                    <Link
                        to="/search"
                        className="btn btn-light btn-lg px-5 py-3 rounded-3 fw-semibold"
                        style={{ transition: 'all 0.3s ease', position: 'relative', zIndex: 11 }}
                        onClick={() => console.log('Hero Browse Equipment clicked')}
                    >
                      <i className="bi bi-search me-2"></i>
                      Browse Equipment
                    </Link>
                    {!user && (
                        <Link
                            to="/register"
                            className="btn btn-outline-light btn-lg px-5 py-3 rounded-3 fw-semibold"
                        >
                          <i className="bi bi-person-plus me-2"></i>
                          Get Started
                        </Link>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-lg-6 text-center">
                <div style={{ animation: 'slideInRight 1s ease 0.3s both' }}>
                  <div
                      className="d-inline-flex align-items-center justify-content-center mb-4"
                      style={{
                        width: '200px',
                        height: '200px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '50%',
                        backdropFilter: 'blur(20px)'
                      }}
                  >
                    <i className="bi bi-hospital text-white" style={{ fontSize: '6rem' }}></i>
                  </div>
                  <div className="row g-3 mt-4">
                    <div className="col-4">
                      <div className="glass-card p-3 text-center">
                        <h4 className="fw-bold text-white mb-1">{stats.total}+</h4>
                        <small className="text-white-50">Equipment</small>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="glass-card p-3 text-center">
                        <h4 className="fw-bold text-white mb-1">{stats.available}+</h4>
                        <small className="text-white-50">Available</small>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="glass-card p-3 text-center">
                        <h4 className="fw-bold text-white mb-1">{stats.locations}+</h4>
                        <small className="text-white-50">Locations</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="position-absolute" style={{
            bottom: '-50px',
            left: '-50px',
            width: '100px',
            height: '100px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%'
          }}></div>
          <div className="position-absolute" style={{
            top: '20%',
            right: '10%',
            width: '60px',
            height: '60px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%'
          }}></div>
        </section>

        {/* Features Section */}
        <section className="py-5">
          <div className="container">
            <div className="text-center mb-5">
              <h2 className="display-5 fw-bold text-gradient mb-3">Why Choose MediLink?</h2>
              <p className="lead text-muted">Experience the future of medical equipment rental</p>
            </div>

            <div className="row g-4">
              {features.map((feature, index) => (
                  <div
                      key={index}
                      className="col-lg-3 col-md-6"
                      style={{
                        animation: `fadeInUp 0.6s ease ${index * 0.1}s both`
                      }}
                  >
                    <div className="modern-card h-100 p-4 text-center hover-lift">
                      <div
                          className="d-inline-flex align-items-center justify-content-center mb-3"
                          style={{
                            width: '80px',
                            height: '80px',
                            background: feature.color + '20',
                            borderRadius: '20px'
                          }}
                      >
                        <i className={`bi ${feature.icon}`} style={{
                          fontSize: '2rem',
                          color: feature.color
                        }}></i>
                      </div>
                      <h5 className="fw-bold mb-3">{feature.title}</h5>
                      <p className="text-muted">{feature.description}</p>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Equipment Section */}
        <section className="py-5" style={{ background: 'rgba(255, 255, 255, 0.5)' }}>
          <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-5">
              <div>
                <h2 className="display-6 fw-bold text-gradient mb-2">Featured Equipment</h2>
                <p className="text-muted mb-0">Discover our most popular medical equipment</p>
              </div>
              <Link to="/search" className="btn btn-gradient-primary">
                View All <i className="bi bi-arrow-right ms-2"></i>
              </Link>
            </div>

            {loading ? (
                <div className="row g-4">
                  {[...Array(6)].map((_, index) => (
                      <div key={index} className="col-lg-4 col-md-6">
                        <div className="modern-card p-4">
                          <div className="loading-skeleton rounded-3 mb-3" style={{ height: '150px' }}></div>
                          <div className="loading-skeleton rounded mb-2" style={{ height: '20px', width: '70%' }}></div>
                          <div className="loading-skeleton rounded mb-2" style={{ height: '16px', width: '50%' }}></div>
                          <div className="loading-skeleton rounded" style={{ height: '40px' }}></div>
                        </div>
                      </div>
                  ))}
                </div>
            ) : (
                <div className="row g-4">
                  {featuredEquipment.map((equipment, index) => (
                      <div
                          key={equipment.id}
                          className="col-lg-4 col-md-6"
                          style={{
                            animation: `fadeInUp 0.6s ease ${index * 0.1}s both`
                          }}
                      >
                        <div className="modern-card h-100 overflow-hidden hover-lift">
                          <div
                              className="p-4 text-center text-white position-relative"
                              style={{
                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                minHeight: '150px'
                              }}
                          >
                            <div className="position-absolute top-0 end-0 m-3">
                        <span className={`badge ${equipment.availability ? 'status-available' : 'status-rented'}`}>
                          {equipment.availability ? 'Available' : 'Rented'}
                        </span>
                            </div>
                            <div className="d-flex align-items-center justify-content-center h-100">
                              <i className="bi bi-hospital" style={{ fontSize: '3rem', opacity: 0.8 }}></i>
                            </div>
                          </div>

                          <div className="p-4">
                            <h5 className="fw-bold mb-2">{equipment.name}</h5>
                            <div className="mb-3">
                              <div className="d-flex align-items-center mb-2">
                                <i className="bi bi-grid text-primary me-2"></i>
                                <small className="text-muted">{equipment.type}</small>
                              </div>
                              <div className="d-flex align-items-center mb-2">
                                <i className="bi bi-geo-alt text-success me-2"></i>
                                <small className="text-muted">{equipment.location}</small>
                              </div>
                              <div className="d-flex align-items-center">
                                <i className="bi bi-currency-rupee text-warning me-2"></i>
                                <span className="fw-semibold text-success">₹{equipment.price}/day</span>
                              </div>
                            </div>

                            <Link
                                to={`/equipment/${equipment.id}`}
                                className="btn btn-gradient-primary w-100"
                            >
                              View Details <i className="bi bi-arrow-right ms-2"></i>
                            </Link>
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-5" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <div className="container text-center">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <h2 className="display-5 fw-bold mb-4">Ready to Get Started?</h2>
                <p className="lead mb-5">
                  Join thousands of healthcare providers who trust MediLink for their medical equipment needs.
                </p>
                <div className="d-flex justify-content-center gap-3" style={{ position: 'relative', zIndex: 10 }}>
                  {!user ? (
                      <>
                        <Link to="/register" className="btn btn-light btn-lg px-5 py-3 rounded-3 fw-semibold" style={{ position: 'relative', zIndex: 11 }}>
                          <i className="bi bi-person-plus me-2"></i>
                          Create Account
                        </Link>
                        <Link to="/search" className="btn btn-outline-light btn-lg px-5 py-3 rounded-3 fw-semibold" onClick={() => console.log('CTA Browse Equipment clicked')} style={{ position: 'relative', zIndex: 11 }}>
                          <i className="bi bi-search me-2"></i>
                          Browse Equipment
                        </Link>
                      </>
                  ) : (
                      <Link to="/dashboard" className="btn btn-light btn-lg px-5 py-3 rounded-3 fw-semibold">
                        <i className="bi bi-search me-2"></i>
                        Start Renting Equipment
                      </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
  );
};

export default Home;