import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Search = () => {
  const [equipment, setEquipment] = useState([]);
  const [allEquipment, setAllEquipment] = useState([]); // Store all equipment separately
  const [loading, setLoading] = useState(true);
  const [searchType, setSearchType] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchEquipment();
    fetchFilterOptions();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4004/api/equipments');
      setAllEquipment(response.data); // Store all equipment
      setEquipment(response.data); // Initially show all equipment
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get('http://localhost:4004/api/equipments');
      const data = response.data;

      // Extract unique equipment types
      const types = [...new Set(data.map(item => item.type))];
      setEquipmentTypes(types);

      // Extract unique locations
      const locationsList = [...new Set(data.map(item => item.location))];
      setLocations(locationsList);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Build search parameters - backend requires all three parameters
      const searchParams = {
        type: searchType || '', // Send empty string if not selected
        location: searchLocation || '', // Send empty string if not selected
        availability: null // Always send null since we removed availability filter
      };
      
      // Try backend search first
      try {
        const response = await axios.get('http://localhost:4004/api/equipments/search', {
          params: searchParams,
        });
        setEquipment(response.data);
      } catch (backendError) {
        console.log('Backend search failed, using client-side filtering');
        // Fallback to client-side filtering
        applyClientSideFilters();
      }
    } catch (error) {
      console.error('Error in search:', error);
      // Final fallback - load all equipment
      setEquipment(allEquipment);
    } finally {
      setLoading(false);
      // On mobile, close the filters after search
      if (window.innerWidth < 768) {
        setShowFilters(false);
      }
    }
  };

  // Client-side filtering function
  const applyClientSideFilters = () => {
    let filtered = [...allEquipment]; // Use the complete list
    
    if (searchType) {
      filtered = filtered.filter(item => 
        item.type.toLowerCase().includes(searchType.toLowerCase())
      );
    }
    
    if (searchLocation) {
      filtered = filtered.filter(item => 
        item.location.toLowerCase().includes(searchLocation.toLowerCase())
      );
    }
    
    setEquipment(filtered);
  };

  // Auto-search when filters change
  useEffect(() => {
    if (searchType || searchLocation) {
      const timeoutId = setTimeout(() => {
        // Use client-side filtering for real-time updates
        applyClientSideFilters();
      }, 300); // 300ms debounce
      
      return () => clearTimeout(timeoutId);
    } else {
      // If no filters, show all equipment
      setEquipment(allEquipment);
    }
  }, [searchType, searchLocation, allEquipment]);

  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'type':
        setSearchType(value);
        break;
      case 'location':
        setSearchLocation(value);
        break;
      default:
        break;
    }
  };

  const resetFilters = () => {
    setSearchType('');
    setSearchLocation('');
    setEquipment(allEquipment);
  };

  return (
      <div className="min-vh-100" style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}>
        {/* Header Section */}
        <div className="hero-section py-5 mb-5">
          <div className="container">
            <div className="row justify-content-center text-center">
              <div className="col-lg-8" style={{ animation: 'fadeInUp 0.8s ease' }}>
                <h1 className="display-4 fw-bold text-white mb-3">
                  Find Medical Equipment
                </h1>
                <p className="lead text-white-50 mb-5">
                  Browse our extensive collection of high-quality medical equipment available for rent
                </p>

                {/* Quick Search Bar (Desktop) */}
                <div className="d-none d-md-block">
                  <form onSubmit={handleSearch} className="glass-card p-3 d-flex gap-2">
                    <div className="flex-grow-1">
                      <select
                          className="form-select modern-form-control border-0"
                          value={searchType}
                          onChange={(e) => handleFilterChange('type', e.target.value)}
                      >
                        <option value="">All Equipment Types</option>
                        {equipmentTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-grow-1">
                      <select
                          className="form-select modern-form-control border-0"
                          value={searchLocation}
                          onChange={(e) => handleFilterChange('location', e.target.value)}
                      >
                        <option value="">All Locations</option>
                        {locations.map(location => (
                            <option key={location} value={location}>{location}</option>
                        ))}
                      </select>
                    </div>
                    <button type="submit" className="btn btn-light px-4">
                      <i className="bi bi-search me-2"></i>Search
                    </button>
                    {(searchType || searchLocation)}
                  </form>
                </div>

                {/* Mobile Search Button */}
                <div className="d-md-none">
                  <button
                      className="btn btn-light btn-lg w-100 py-3 rounded-3"
                      onClick={() => setShowFilters(!showFilters)}
                  >
                    <i className={`bi ${showFilters ? 'bi-x-lg' : 'bi-filter'} me-2`}></i>
                    {showFilters ? 'Close Filters' : 'Show Search Filters'}
                    {(searchType || searchLocation) && (
                      <span className="badge bg-primary ms-2">
                        {[searchType, searchLocation].filter(Boolean).length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container pb-5">
          <div className="row g-4">
            {/* Filters Sidebar */}
            <div className={`col-lg-3 ${showFilters ? 'd-block' : 'd-none d-lg-block'}`} style={{ animation: 'fadeInUp 0.6s ease' }}>
              <div className="modern-card p-4 sticky-top" style={{ top: '100px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0">
                    <i className="bi bi-filter me-2 text-primary"></i>
                    Filters
                    {(searchType || searchLocation) && (
                      <span className="badge bg-primary ms-2">
                        {[searchType, searchLocation].filter(Boolean).length} Active
                      </span>
                    )}
                  </h5>
                  <button
                      className="btn btn-sm text-danger"
                      onClick={resetFilters}
                  >
                    <i className="bi bi-arrow-counterclockwise me-1"></i>
                    Reset
                  </button>
                </div>

                <form onSubmit={handleSearch}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Equipment Type</label>
                    <select
                        className="form-select modern-form-control"
                        value={searchType}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                    >
                      <option value="">All Types</option>
                      {equipmentTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Location</label>
                    <select
                        className="form-select modern-form-control"
                        value={searchLocation}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                    >
                      <option value="">All Locations</option>
                      {locations.map(location => (
                          <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                  </div>

                  <button
                      type="submit"
                      className="btn btn-gradient-primary w-100 py-3"
                  >
                    <i className="bi bi-search me-2"></i>
                    Apply Filters
                  </button>

                  {/* Mobile Only Close Button */}
                  <div className="d-lg-none text-center mt-3">
                    <button
                        type="button"
                        className="btn btn-link text-muted"
                        onClick={() => setShowFilters(false)}
                    >
                      <i className="bi bi-x-circle me-1"></i>
                      Close Filters
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Equipment Results */}
            <div className="col-lg-9">
              <div className="d-flex justify-content-between align-items-center mb-4" style={{ animation: 'fadeInUp 0.6s ease' }}>
                <div>
                  <h4 className="fw-bold mb-1 text-gradient">Search Results</h4>
                  <p className="text-muted mb-0">
                    {equipment.length} equipment found
                    {(searchType || searchLocation) && (
                      <span className="ms-2">
                        • Filtered by: 
                        {searchType && <span className="badge bg-light text-dark me-1">{searchType}</span>}
                        {searchLocation && <span className="badge bg-light text-dark me-1">{searchLocation}</span>}
                      </span>
                    )}
                  </p>
                </div>
                <div className="d-none d-lg-block">
                  <button
                      className="btn btn-outline-primary rounded-3 px-4 d-inline-flex align-items-center"
                      onClick={resetFilters}
                  >
                    <i className="bi bi-arrow-repeat me-2"></i>
                    Refresh Results
                  </button>
                </div>
              </div>

              {loading ? (
                  <div className="row g-4">
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className="col-md-6 col-lg-4" style={{ animation: `fadeInUp ${0.2 + index * 0.1}s ease` }}>
                          <div className="modern-card p-4 h-100">
                            <div className="loading-skeleton rounded-3 mb-3" style={{ height: '150px' }}></div>
                            <div className="loading-skeleton rounded mb-2" style={{ height: '24px', width: '80%' }}></div>
                            <div className="loading-skeleton rounded mb-2" style={{ height: '18px', width: '60%' }}></div>
                            <div className="loading-skeleton rounded mb-2" style={{ height: '18px', width: '40%' }}></div>
                            <div className="loading-skeleton rounded" style={{ height: '40px' }}></div>
                          </div>
                        </div>
                    ))}
                  </div>
              ) : equipment.length === 0 ? (
                  <div className="modern-card p-5 text-center" style={{ animation: 'fadeInUp 0.6s ease' }}>
                    <div className="mb-4">
                      <i className="bi bi-search text-muted" style={{ fontSize: '4rem', opacity: 0.3 }}></i>
                    </div>
                    <h5 className="fw-bold mb-3">No Equipment Found</h5>
                    <p className="text-muted mb-4">
                      {(searchType || searchLocation) 
                        ? "We couldn't find any equipment matching your current filters."
                        : "We couldn't find any equipment in our database."
                      }
                    </p>
                    <div className="d-flex gap-2 justify-content-center">
                      {(searchType || searchLocation) && (
                        <button
                            className="btn btn-gradient-primary px-4 py-2"
                            onClick={resetFilters}
                        >
                          <i className="bi bi-arrow-counterclockwise me-2"></i>
                          Clear Filters
                        </button>
                      )}
                      <button
                          className="btn btn-outline-primary px-4 py-2"
                          onClick={fetchEquipment}
                      >
                          <i className="bi bi-arrow-repeat me-2"></i>
                          Refresh
                      </button>
                    </div>
                  </div>
              ) : (
                  <div className="row g-4">
                    {equipment.map((item, index) => (
                        <div
                            key={item.id}
                            className="col-md-6 col-lg-4"
                            style={{ animation: `fadeInUp ${0.2 + index * 0.1}s ease` }}
                        >
                          <div className="modern-card h-100 hover-lift overflow-hidden">
                            <div
                                className="p-4 text-center text-white position-relative"
                                style={{
                                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                  minHeight: '140px'
                                }}
                            >
                              <div className="position-absolute top-0 end-0 m-3">
                          <span className={`badge ${item.availability ? 'status-available' : 'status-rented'}`}>
                            {item.availability ? 'Available' : 'Rented'}
                          </span>
                              </div>
                              <div className="d-flex align-items-center justify-content-center h-100">
                                <i className="bi bi-hospital" style={{ fontSize: '3rem', opacity: 0.8 }}></i>
                              </div>
                            </div>

                            <div className="p-4">
                              <h5 className="fw-bold mb-3">{item.name}</h5>
                              <div className="mb-3">
                                <div className="d-flex align-items-center mb-2">
                                  <i className="bi bi-grid text-primary me-2"></i>
                                  <small className="text-muted">{item.type}</small>
                                </div>
                                <div className="d-flex align-items-center mb-2">
                                  <i className="bi bi-geo-alt text-success me-2"></i>
                                  <small className="text-muted">{item.location}</small>
                                </div>
                                <div className="d-flex align-items-center">
                                  <i className="bi bi-currency-rupee text-warning me-2"></i>
                                  <span className="fw-semibold text-success">₹{item.price}/day</span>
                                </div>
                              </div>

                              <Link
                                  to={`/equipment/${item.id}`}
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
          </div>
        </div>
      </div>
  );
};

export default Search;