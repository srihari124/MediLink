import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import EditModal from './EditModal';
import axios from 'axios';

const Dashboard = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalShow, setModalShow] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [newEquipment, setNewEquipment] = useState({
    name: '',
    type: '',
    location: '',
    price: '',
    availability: true,
  });
  const [formMode, setFormMode] = useState('add');
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState({
    totalEquipment: 0,
    availableEquipment: 0,
    rentedEquipment: 0,
    totalBookings: 0
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'HOSPITAL_ADMIN') {
      navigate('/login');
    } else {
      fetchEquipment();
      fetchStats();
    }
  }, [user, navigate]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:4004/api/equipments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEquipment(response.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      showToast('Failed to load equipment list', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const equipmentResponse = await axios.get('http://localhost:4004/api/equipments', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Try to fetch bookings, but don't fail if the endpoint doesn't exist
      let totalBookings = 0;
      try {
        // Get user ID for the bookings request
        const userId = user?.id || user?.sub || user?.userId;
        
        if (userId) {
          const bookingsResponse = await axios.get('http://localhost:4004/api/bookings', {
            headers: { 
              'X-User-Id': userId,
              'Authorization': `Bearer ${token}` 
            },
          });
          totalBookings = bookingsResponse.data.length;
        }
      } catch (bookingsError) {
        console.log('Bookings API not available, setting totalBookings to 0');
        totalBookings = 0;
      }

      const equipmentData = equipmentResponse.data;
      const availableCount = equipmentData.filter(item => item.availability).length;

      setStats({
        totalEquipment: equipmentData.length,
        availableEquipment: availableCount,
        rentedEquipment: equipmentData.length - availableCount,
        totalBookings: totalBookings
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAddEquipment = () => {
    setFormMode('add');
    setNewEquipment({
      name: '',
      type: '',
      location: '',
      price: '',
      availability: true,
    });
    setShowForm(true);
  };

  const handleEditEquipment = (equipment) => {
    setFormMode('edit');
    setNewEquipment({
      id: equipment.id,
      name: equipment.name,
      type: equipment.type,
      location: equipment.location,
      price: equipment.price,
      availability: equipment.availability,
    });
    setShowForm(true);
  };

  const handleDeleteEquipment = (equipment) => {
    setDeleteConfirmation(equipment);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:4004/api/equipments/${deleteConfirmation.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEquipment(equipment.filter(item => item.id !== deleteConfirmation.id));
      setDeleteConfirmation(null);
      showToast('Equipment deleted successfully', 'success');
      fetchStats();
    } catch (error) {
      console.error('Error deleting equipment:', error);
      showToast('Failed to delete equipment', 'danger');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      if (formMode === 'add') {
        const response = await axios.post(
            'http://localhost:4004/api/equipments/add',
            newEquipment,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        setEquipment([...equipment, response.data]);
        showToast('Equipment added successfully', 'success');
      } else {
        await axios.put(
            `http://localhost:4004/api/equipments/${newEquipment.id}`,
            newEquipment,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        setEquipment(
            equipment.map(item => (item.id === newEquipment.id ? newEquipment : item))
        );
        showToast('Equipment updated successfully', 'success');
      }

      setShowForm(false);
      fetchStats();
    } catch (error) {
      console.error('Error submitting form:', error);
      showToast('Failed to save equipment', 'danger');
    }
  };

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Check if current user can edit/delete this equipment
  const canManageEquipment = (equipment) => {
    if (!user || !equipment) return false;
    
    const equipmentOwnerId = equipment.userId || equipment.createdBy || equipment.user_id || equipment.created_by;
    const currentUserId = user.id || user.sub || user.userId;
    
    console.log('Equipment owner ID:', equipmentOwnerId);
    console.log('Current user ID:', currentUserId);
    console.log('Can manage:', equipmentOwnerId === currentUserId);
    
    return equipmentOwnerId === currentUserId;
  };

  const filteredEquipment = equipment.filter(item => {
    if (!searchTerm) return true;
    const searchTermLower = searchTerm.toLowerCase();
    return (
        item.name.toLowerCase().includes(searchTermLower) ||
        item.type.toLowerCase().includes(searchTermLower) ||
        item.location.toLowerCase().includes(searchTermLower)
    );
  });

  const equipmentTypes = [...new Set(equipment.map(item => item.type))];
  const locations = [...new Set(equipment.map(item => item.location))];

  return (
      <div className="min-vh-100" style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}>
        <div className="container py-5">
          {/* Toast Notification */}
          {toastMessage && (
              <div className={`position-fixed top-0 end-0 p-3`} style={{ zIndex: 9999 }}>
                <div
                    className={`toast show align-items-center text-white bg-${toastMessage.type} border-0 rounded-3`}
                    role="alert"
                    style={{
                      boxShadow: 'var(--shadow-lg)',
                      animation: 'slideInRight 0.3s ease'
                    }}
                >
                  <div className="d-flex">
                    <div className="toast-body d-flex align-items-center">
                      <i className={`bi ${toastMessage.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
                      {toastMessage.message}
                    </div>
                    <button
                        type="button"
                        className="btn-close btn-close-white me-2 m-auto"
                        onClick={() => setToastMessage(null)}
                    ></button>
                  </div>
                </div>
              </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirmation && (
              <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content modern-card border-0">
                    <div className="modal-header border-0 pb-0">
                      <h5 className="modal-title fw-bold">
                        <i className="bi bi-exclamation-triangle text-danger me-2"></i>
                        Confirm Deletion
                      </h5>
                      <button
                          type="button"
                          className="btn-close"
                          onClick={() => setDeleteConfirmation(null)}
                      ></button>
                    </div>
                    <div className="modal-body py-4">
                      <p className="mb-0">Are you sure you want to delete <strong>{deleteConfirmation.name}</strong>? This action cannot be undone.</p>
                    </div>
                    <div className="modal-footer border-0 pt-0">
                      <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setDeleteConfirmation(null)}
                      >
                        Cancel
                      </button>
                      <button
                          type="button"
                          className="btn btn-danger"
                          onClick={confirmDelete}
                      >
                        Delete Equipment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
          )}

          {/* Page Header */}
          <div className="d-flex justify-content-between align-items-center mb-5" style={{ animation: 'fadeInUp 0.6s ease' }}>
            <div>
              <h2 className="display-6 fw-bold text-gradient mb-1">Equipment Dashboard</h2>
              <p className="text-muted mb-0">
                Manage your medical equipment inventory. You can only edit or delete equipment that you added.
                <span className="badge bg-success ms-2" style={{ fontSize: '0.6rem' }}>
                  <i className="bi bi-person-check me-1"></i>
                  Owner
                </span> indicates your equipment.
              </p>
            </div>
            <button
                className="btn btn-gradient-primary px-4 py-2"
                onClick={handleAddEquipment}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Add Equipment
            </button>
          </div>

          {/* Stats Cards */}
          <div className="row g-4 mb-5" style={{ animation: 'fadeInUp 0.6s ease 0.1s both' }}>
            <div className="col-md-6 col-lg-3">
              <div className="modern-card p-4 hover-lift">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="fw-bold mb-1">{stats.totalEquipment}</h3>
                    <p className="text-muted mb-0">Total Equipment</p>
                  </div>
                  <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: '60px',
                        height: '60px',
                        background: '#667eea20',
                        borderRadius: '15px'
                      }}
                  >
                    <i className="bi bi-hospital fs-2 text-primary"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="modern-card p-4 hover-lift">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="fw-bold mb-1">{stats.availableEquipment}</h3>
                    <p className="text-muted mb-0">Available</p>
                  </div>
                  <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: '60px',
                        height: '60px',
                        background: '#28a74520',
                        borderRadius: '15px'
                      }}
                  >
                    <i className="bi bi-check-circle fs-2 text-success"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="modern-card p-4 hover-lift">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="fw-bold mb-1">{stats.rentedEquipment}</h3>
                    <p className="text-muted mb-0">Rented</p>
                  </div>
                  <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: '60px',
                        height: '60px',
                        background: '#dc354520',
                        borderRadius: '15px'
                      }}
                  >
                    <i className="bi bi-clipboard-x fs-2 text-danger"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="modern-card p-4 hover-lift">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="fw-bold mb-1">{stats.totalBookings}</h3>
                    <p className="text-muted mb-0">Total Bookings</p>
                  </div>
                  <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: '60px',
                        height: '60px',
                        background: '#ffc10720',
                        borderRadius: '15px'
                      }}
                  >
                    <i className="bi bi-calendar-check fs-2 text-warning"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Equipment Form */}
          {showForm && (
              <div className="modern-card mb-5 p-4" style={{ animation: 'fadeInUp 0.6s ease' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0">
                    <i className="bi bi-gear me-2 text-primary"></i>
                    {formMode === 'add' ? 'Add New Equipment' : 'Edit Equipment'}
                  </h5>
                  <button
                      className="btn btn-sm btn-outline-secondary rounded-circle"
                      onClick={() => setShowForm(false)}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>

                <form onSubmit={handleFormSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Equipment Name</label>
                      <input
                          type="text"
                          className="modern-form-control form-control"
                          placeholder="Enter equipment name"
                          value={newEquipment.name}
                          onChange={(e) => setNewEquipment({...newEquipment, name: e.target.value})}
                          required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Equipment Type</label>
                      <input
                          type="text"
                          className="modern-form-control form-control"
                          placeholder="Enter equipment type"
                          value={newEquipment.type}
                          onChange={(e) => setNewEquipment({...newEquipment, type: e.target.value})}
                          list="typeOptions"
                          required
                      />
                      <datalist id="typeOptions">
                        {equipmentTypes.map(type => (
                            <option key={type} value={type} />
                        ))}
                      </datalist>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Location</label>
                      <input
                          type="text"
                          className="modern-form-control form-control"
                          placeholder="Enter location"
                          value={newEquipment.location}
                          onChange={(e) => setNewEquipment({...newEquipment, location: e.target.value})}
                          list="locationOptions"
                          required
                      />
                      <datalist id="locationOptions">
                        {locations.map(location => (
                            <option key={location} value={location} />
                        ))}
                      </datalist>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Daily Rental Price (₹)</label>
                      <input
                          type="number"
                          className="modern-form-control form-control"
                          placeholder="Enter price per day"
                          value={newEquipment.price}
                          onChange={(e) => setNewEquipment({...newEquipment, price: e.target.value})}
                          min="0"
                          required
                      />
                    </div>

                    <div className="col-12">
                      <div className="form-check">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            checked={newEquipment.availability}
                            onChange={(e) => setNewEquipment({...newEquipment, availability: e.target.checked})}
                            id="availabilityCheck"
                        />
                        <label className="form-check-label fw-semibold" htmlFor="availabilityCheck">
                          Available for Rent
                        </label>
                      </div>
                    </div>

                    <div className="col-12 mt-4">
                      <div className="d-flex gap-2">
                        <button
                            type="button"
                            className="btn btn-outline-secondary px-4 py-2"
                            onClick={() => setShowForm(false)}
                        >
                          Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-gradient-primary px-4 py-2"
                        >
                          {formMode === 'add' ? (
                              <>
                                <i className="bi bi-plus-lg me-2"></i>
                                Add Equipment
                              </>
                          ) : (
                              <>
                                <i className="bi bi-check-lg me-2"></i>
                                Save Changes
                              </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
          )}

          {/* Equipment Table */}
          <div className="modern-card p-4" style={{ animation: 'fadeInUp 0.6s ease 0.2s both' }}>
            <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-list-ul me-2 text-primary"></i>
                Equipment Inventory
              </h5>

              <div className="d-flex gap-3 mt-3 mt-md-0">
                <div className="position-relative">
                  <input
                      type="text"
                      className="modern-form-control form-control"
                      placeholder="Search equipment..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <i className="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3 text-muted"></i>
                </div>
                <button
                    className="btn btn-outline-primary d-none d-md-block"
                    onClick={fetchEquipment}
                >
                  <i className="bi bi-arrow-repeat me-md-2"></i>
                  <span className="d-none d-md-inline">Refresh</span>
                </button>
              </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <h6 className="text-muted">Loading equipment inventory...</h6>
                </div>
            ) : filteredEquipment.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-inbox text-muted" style={{ fontSize: '4rem', opacity: 0.3 }}></i>
                  <h5 className="fw-bold mt-3">No equipment found</h5>
                  <p className="text-muted mb-4">
                    {searchTerm ? 'No equipment matches your search criteria.' : 'Your inventory is empty.'}
                  </p>
                  {searchTerm ? (
                      <button
                          className="btn btn-outline-primary px-4 py-2"
                          onClick={() => setSearchTerm('')}
                      >
                        <i className="bi bi-x-circle me-2"></i>
                        Clear Search
                      </button>
                  ) : (
                      <button
                          className="btn btn-gradient-primary px-4 py-2"
                          onClick={handleAddEquipment}
                      >
                        <i className="bi bi-plus-lg me-2"></i>
                        Add Equipment
                      </button>
                  )}
                </div>
            ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="table-responsive d-none d-md-block">
                    <table className="table table-hover">
                      <thead className="table-light">
                      <tr>
                        <th scope="col" className="fw-semibold text-muted">Name</th>
                        <th scope="col" className="fw-semibold text-muted">Type</th>
                        <th scope="col" className="fw-semibold text-muted">Location</th>
                        <th scope="col" className="fw-semibold text-muted">Price/Day</th>
                        <th scope="col" className="fw-semibold text-muted">Status</th>
                        <th scope="col" className="fw-semibold text-muted text-center">Actions</th>
                      </tr>
                      </thead>
                      <tbody>
                      {filteredEquipment.map((item) => (
                          <tr key={item.id} className="align-middle">
                            <td className="fw-semibold">
                              {item.name}
                              {canManageEquipment(item) && (
                                <span className="badge bg-success ms-2" style={{ fontSize: '0.6rem' }}>
                                  <i className="bi bi-person-check me-1"></i>
                                  Owner
                                </span>
                              )}
                            </td>
                            <td>{item.type}</td>
                            <td>{item.location}</td>
                            <td>₹{item.price}</td>
                            <td>
                          <span className={`badge ${item.availability ? 'status-available' : 'status-rented'}`}>
                            {item.availability ? 'Available' : 'Rented'}
                          </span>
                            </td>
                            <td>
                              <div className="d-flex justify-content-center gap-2">
                                {canManageEquipment(item) ? (
                                  <>
                                    <button
                                        className="btn btn-sm btn-outline-primary px-3 py-1"
                                        onClick={() => handleEditEquipment(item)}
                                        title="Edit Equipment"
                                        style={{
                                          fontSize: '0.8rem',
                                          fontWeight: '500',
                                          borderWidth: '1.5px',
                                          transition: 'all 0.2s ease'
                                        }}
                                    >
                                      <i className="bi bi-pencil me-1"></i>
                                      Edit
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger px-3 py-1"
                                        onClick={() => handleDeleteEquipment(item)}
                                        title="Delete Equipment"
                                        style={{
                                          fontSize: '0.8rem',
                                          fontWeight: '500',
                                          borderWidth: '1.5px',
                                          transition: 'all 0.2s ease'
                                        }}
                                    >
                                      <i className="bi bi-trash me-1"></i>
                                      Delete
                                    </button>
                                  </>
                                ) : (
                                  <small className="text-muted">No actions available</small>
                                )}
                              </div>
                            </td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="d-md-none">
                    {filteredEquipment.map((item) => (
                      <div key={item.id} className="equipment-card mb-3 position-relative">
                        <div className={`equipment-accent-bar ${item.availability ? 'available' : 'rented'}`}></div>
                        <div className="equipment-card-header d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-2">
                            <div className="equipment-icon">
                              <i className="bi bi-hospital fs-4"></i>
                            </div>
                            <span className="equipment-title">{item.name}</span>
                            {canManageEquipment(item) && (
                              <span className="badge bg-success ms-2" style={{ fontSize: '0.6rem' }}>
                                <i className="bi bi-person-check me-1"></i>
                                Owner
                              </span>
                            )}
                          </div>
                          <span className={`badge ${item.availability ? 'status-available' : 'status-rented'}`}>{item.availability ? 'Available' : 'Rented'}</span>
                        </div>
                        <div className="p-3">
                          <div className="d-flex flex-wrap gap-3 mb-2">
                            <div className="d-flex align-items-center gap-1">
                              <i className="bi bi-grid text-primary"></i>
                              <small className="text-muted">{item.type}</small>
                            </div>
                            <div className="d-flex align-items-center gap-1">
                              <i className="bi bi-geo-alt text-success"></i>
                              <small className="text-muted">{item.location}</small>
                            </div>
                          </div>
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <i className="bi bi-currency-rupee text-warning"></i>
                            <span className="fw-bold fs-5 text-success">{item.price}</span>
                            <span className="text-muted">/day</span>
                          </div>
                        </div>
                        <div className="equipment-card-footer d-flex gap-2 p-2">
                          {canManageEquipment(item) ? (
                            <>
                              <button
                                className="btn btn-sm btn-outline-primary flex-grow-1"
                                onClick={() => handleEditEquipment(item)}
                              >
                                <i className="bi bi-pencil me-1"></i>
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger flex-grow-1"
                                onClick={() => handleDeleteEquipment(item)}
                              >
                                <i className="bi bi-trash me-1"></i>
                                Delete
                              </button>
                            </>
                          ) : (
                            <small className="text-muted w-100 text-center">No actions available</small>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
            )}
          </div>
        </div>
      </div>
  );
};

export default Dashboard;