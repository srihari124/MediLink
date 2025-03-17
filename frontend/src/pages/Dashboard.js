// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [equipment, setEquipment] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/equipment');
      setEquipment(response.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  const handleAddEquipment = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/equipment', { name, type, location, price: Number(price), availability:true});
      console.log("Added Equipment:", response.data);
      fetchEquipment();
      setName('');
      setType('');
      setLocation('');
      setPrice('');
    } catch (error) {
      console.error('Error adding equipment:', error);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Dashboard</h2>
      <div className="alert alert-info">
        <div className="card-body">
          <h5 className="card-title" style={{color: 'black'}}>Add New Equipment</h5>
          <form onSubmit={handleAddEquipment}>
            <div className="row g-3">
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Name"
                  style={{color: 'black'}}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type"
                  style={{color: 'black'}}
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Location"
                  style={{color: 'black'}}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-2">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Price"
                  style={{color: 'black'}}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  required
                />
              </div>
              <div className="col-md-1">
                <button type="submit" className="btn btn-primary w-100">
                  Add
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <h3 className="text-center mb-4">Equipment List</h3>
      <div className="row">
        {equipment.map((item) => (
          <div key={item.id} className="col-md-4 mb-4">
            <div className="alert alert-info">
              <div className="card-body">
                <h5 className="card-title" style={{color: 'black'}}>{item.name}</h5>
                <p className="card-text" style={{color: 'black'}}>
                  <strong>Type:</strong> {item.type}<br />
                  <strong>Location:</strong> {item.location}<br />
                  <strong>Price:</strong> ₹{item.price}<br />
                  <p>
                    <strong>Availability: </strong> 
                    <span className={item.availability ? 'text-success' : 'text-danger'}>
                      {item.availability ? 'Available' : 'Not Available'}
                    </span>
                  </p>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;