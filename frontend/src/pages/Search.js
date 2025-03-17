// src/pages/Search.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EquipmentCard from '../components/EquipmentCard';

const Search = () => {
  const [equipment, setEquipment] = useState([]);
  const [searchType, setSearchType] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchAvailability, setSearchAvailability] = useState(true);

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

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get('http://localhost:8080/api/equipment/search', {
        params: { type: searchType, location: searchLocation, availability: searchAvailability },
      });
      setEquipment(response.data);
    } catch (error) {
      console.error('Error searching equipment:', error);
    }
  };

  return (
    <div className="container mt-5">
      <h2 style={{color: 'white'}}>Search Equipment</h2>
      <form onSubmit={handleSearch} className="mb-4">
        <div className="row g-3">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Type"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Location"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <select
              className="form-control"
              value={searchAvailability}
              onChange={(e) => setSearchAvailability(e.target.value === 'true')}
            >
              <option value={true}>Available</option>
              <option value={false}>Not Available</option>
            </select>
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-primary w-100">
              Search
            </button>
          </div>
        </div>
      </form>
      <div className="row">
        {equipment.map((item) => (
          <div key={item.id} className="col-md-4 mb-4">
            <EquipmentCard equipment={item} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;