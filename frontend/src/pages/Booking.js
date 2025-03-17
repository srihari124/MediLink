// src/pages/Bookings.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../pages/AuthContext';
import { useNavigate } from 'react-router-dom';

const Bookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      const url = user?.role === 'HOSPITAL_ADMIN'
        ? 'http://localhost:8080/api/bookings'
        : `http://localhost:8080/api/bookings/user/${user.userId}`;

      const response = await axios.get(url);
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleStatusUpdate = async (id, action) => {
    try {
      await axios.post(`http://localhost:8080/api/bookings/${id}/${action}`);
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Manage Bookings</h2>
      <div className="row">
        {bookings.map(booking => (
          <div key={booking.id} className="col-md-4 mb-4">
            <div className="card shadow">
              <div className="card-body">
                <h5>{booking.equipment.name}</h5>
                <p>Dates: {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</p>
                <p>Status: {booking.status}</p>

                {user?.role === 'HOSPITAL_ADMIN' && (
                  <div className="mt-3">
                    {booking.status === 'PENDING' && (
                      <button
                        className="btn btn-success btn-sm me-2"
                        onClick={() => handleStatusUpdate(booking.id, 'confirm')}
                      >
                        Confirm
                      </button>
                    )}
                    {booking.status === 'CONFIRMED' && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleStatusUpdate(booking.id, 'complete')}
                      >
                        Mark Complete
                      </button>
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