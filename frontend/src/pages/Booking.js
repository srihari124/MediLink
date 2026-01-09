// src/pages/Bookings.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../pages/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PAYMENT_STATUS } from '../services/api';

const Bookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      // Get user ID from JWT token or user object
      const userId = user?.id || user?.sub || user?.userId;
      
      if (!userId) {
        setError('User ID not found. Please log in again.');
        return;
      }

      console.log('Fetching bookings for user:', userId);
      
      // Use the correct backend endpoint: GET /bookings with X-User-Id header
      const response = await axios.get('http://localhost:4004/api/bookings', {
        headers: { 
          'X-User-Id': userId,
          'Authorization': `Bearer ${token}` 
        }
      });
      
      console.log('Raw booking data:', response.data);
      
      // Sort bookings by date, most recent first
      const sortedBookings = response.data.sort((a, b) => 
        new Date(b.createdAt || b.created_at || b.bookingDate) - new Date(a.createdAt || a.created_at || a.bookingDate)
      );
      
      setBookings(sortedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      
      // Handle specific error cases
      if (error.response?.status === 405) {
        setError('Bookings API endpoint not available. Please check your backend configuration.');
      } else if (error.response?.status === 404) {
        setError('Bookings endpoint not found. Please check your backend routes.');
      } else if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError('Failed to fetch bookings. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, action) => {
    try {
      const token = localStorage.getItem('token');
      const userId = user?.id || user?.sub || user?.userId;
      
      await axios.post(
        `http://localhost:4004/api/bookings/${id}/${action}`,
        {},
        { 
          headers: { 
            'X-User-Id': userId,
            'Authorization': `Bearer ${token}` 
          } 
        }
      );
      await fetchBookings();
      setSuccessMessage(
        action === 'complete'
          ? 'Booking marked as complete!'
          : 'Booking status updated successfully!'
      );
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking status. Please try again.');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-warning';
      case 'CONFIRMED':
        return 'bg-success';
      case 'COMPLETED':
        return 'bg-info';
      case 'CANCELLED':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  const getPaymentStatusBadgeClass = (paymentStatus) => {
    switch (paymentStatus) {
      case PAYMENT_STATUS.SUCCESS:
        return 'bg-success';
      case PAYMENT_STATUS.PENDING:
        return 'bg-warning';
      case PAYMENT_STATUS.FAILED:
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 d-flex justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 pb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Manage Bookings</h2>
        {bookings.length === 0 && (
          <p className="text-muted mb-0">No bookings found</p>
        )}
      </div>
      
      {/* Success Banner */}
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
          {successMessage}
          <button type="button" className="btn-close" onClick={() => setSuccessMessage('')} aria-label="Close"></button>
        </div>
      )}
      
      <div className="row g-4">
        {bookings.map(booking => (
          <div key={booking.id} className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm border-0 rounded-3">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h5 className="card-title mb-0">
                    {booking.equipment?.name || booking.equipmentName || booking.equipment_name || 'Equipment Name N/A'}
                  </h5>
                  <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                    {booking.status || 'N/A'}
                  </span>
                </div>

                <div className="mb-3">
                  <p className="text-muted mb-1 small">Booking Details</p>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Start Date:</span>
                    <span className="fw-semibold">
                      {new Date(booking.startDate || booking.start_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>End Date:</span>
                    <span className="fw-semibold">
                      {new Date(booking.endDate || booking.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Total Price:</span>
                    <span className="fw-semibold text-primary">
                      ₹{(booking.totalPrice || booking.total_price || booking.price || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {booking.payment && (
                  <div className="mb-3">
                    <p className="text-muted mb-1 small">Payment Information</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <span>Payment Status:</span>
                      <span className={`badge ${getPaymentStatusBadgeClass(booking.payment.status)}`}>
                        {booking.payment.status || 'N/A'}
                      </span>
                    </div>
                    {booking.payment.razorpayOrderId && (
                      <div className="mt-2 small text-muted">
                        Order ID: {booking.payment.razorpayOrderId}
                      </div>
                    )}
                  </div>
                )}

                {/* Debug: Show booking ID for troubleshooting */}
                <div className="mt-2 small text-muted">
                  Booking ID: {booking.id || booking.bookingId || 'N/A'}
                </div>

                {user?.role === 'HOSPITAL_ADMIN' && (
                  <div className="mt-3 pt-3 border-top">
                    {booking.status === 'CONFIRMED' && new Date(booking.endDate) < new Date() && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleStatusUpdate(booking.id, 'complete')}
                      >
                        Mark as Complete
                      </button>
                    )}
                    {booking.status === 'CONFIRMED' && new Date(booking.endDate) >= new Date() && (
                      <small className="text-muted">Rental period active</small>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bookings;