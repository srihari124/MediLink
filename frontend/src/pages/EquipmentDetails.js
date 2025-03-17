import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext';
import EditModal from './EditModal';

const EquipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [equipment, setEquipment] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalPrice, setTotalPrice] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    type: '',
    location: '',
    price: '',
    availability: true,
  });

  // Fetch equipment details
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/equipment/${id}`);
        setEquipment(response.data);
        setEditFormData({
          name: response.data.name,
          type: response.data.type,
          location: response.data.location,
          price: response.data.price,
          availability: response.data.availability,
        });
      } catch (error) {
        console.error('Error fetching equipment details:', error);
      }
    };
    fetchEquipment();
  }, [id]);

  // Calculate total price when dates change
  useEffect(() => {
    const calculateTotalPrice = () => {
      if (!equipment || !startDate || !endDate) return;

      const days = calculateDays(startDate, endDate);
      const total = days * equipment.price;
      setTotalPrice(total.toFixed(2));
    };
    calculateTotalPrice();
  }, [startDate, endDate, equipment]);

  // Calculate the number of days between two dates
  const calculateDays = (start, end) => {
    const startDateObj = new Date(start);
    const endDateObj = new Date(end);
    const diffTime = endDateObj - startDateObj;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // Handle booking submission
  const handleBooking = async (e) => {
    e.preventDefault();

    if (new Date(endDate) < new Date(startDate)) {
      alert('End date must be after start date');
      return;
    }

    if (!user) {
      alert('You must be logged in to book equipment.');
      return;
    }

    try {
      await axios.post('http://localhost:8080/api/bookings', {
        equipmentId: id,
        userId: user.userId,
        startDate,
        endDate,
        totalPrice,
        equipmentName: equipment.name,
        status: 'PENDING',
      });
      alert('Booking successful!');
      // Reset form
      setStartDate('');
      setEndDate('');
      setTotalPrice(null);
    } catch (error) {
      console.error('Error booking equipment:', error);
      alert('Booking failed. Please try again.');
    }
  };

  // Handle equipment deletion
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      try {
        await axios.delete(`http://localhost:8080/api/equipment/${id}`);
        alert('Equipment deleted successfully');
        navigate('/equipment');
      } catch (error) {
        console.error('Error deleting equipment:', error);
        alert('Failed to delete equipment');
      }
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:8080/api/equipment/${id}`,
        editFormData
      );
      setEquipment(response.data);
      setShowEditModal(false);
      alert('Equipment updated successfully');
    } catch (error) {
      console.error('Error updating equipment:', error);
      alert('Failed to update equipment');
    }
  };

  // Handle changes in the edit form
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: name === 'availability' ? e.target.checked : value,
    }));
  };

  if (!equipment) {
    return <div className="container mt-5">Loading...</div>;
  }

  return (
    <div className="container mt-5">
      {/* Admin controls */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{color: 'white'}}>{equipment.name}</h2>
        <div>
          <button className="btn btn-warning me-2" onClick={() => setShowEditModal(true)}>
            Edit
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>

      <p><strong style={{color: 'white'}}>Type: </strong> 
      <span style={{ color: 'white' }}>{equipment.type}</span></p>
      <p><strong style={{color: 'white'}}> Location: </strong> 
      <span style={{ color: 'white' }}>{equipment.location}</span></p>
      <p style={{ color: 'white' }}>
        <strong>Price: </strong> ₹{equipment.price}/day
      </p>
      <p className={equipment.availability ? 'text-success' : 'text-danger'}>
        <strong style={{color: 'white'}}>Status:</strong> {equipment.availability ? 'Available' : 'Not Available'}
      </p>

      <form onSubmit={handleBooking} className="mt-4">
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="startDate" className="form-label" style={{color: 'white'}}>Start Date</label>
            <input
              type="date"
              className="form-control"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div className="col-md-6 mb-3">
            <label htmlFor="endDate" className="form-label" style={{color: 'white'}}>End Date</label>
            <input
              type="date"
              className="form-control"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
        </div>

        {totalPrice && (
          <div className="alert alert-info">
            <h5 style={{color: 'black'}}>Booking Summary</h5>
            <p style={{color: 'black'}}>Total Days: {calculateDays(startDate, endDate)}</p>
            <p className="fw-bold" style={{color: 'black'}}>Total Price: ₹{totalPrice}</p>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={!equipment.availability || !user}
          >
          {equipment.availability ? 'Book Now' : 'Currently Unavailable'}
        </button>
      </form>

      <EditModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditSubmit}
        formData={editFormData}
        onChange={handleEditChange}
      />
    </div>
  );
};

export default EquipmentDetails;