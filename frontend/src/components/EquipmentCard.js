// src/components/EquipmentCard.js
import React from 'react';
import { Link } from 'react-router-dom';

const EquipmentCard = ({ equipment }) => {
  return (
    <div className="alert alert-info">
      <div className="card-body">
        <h5 className="card-title" style={{color: 'black'}}>{equipment.name}</h5>
        <p className="card-text" style={{color: 'black'}}>
          <strong>Type:</strong> {equipment.type}<br />
          <strong>Location:</strong> {equipment.location}<br />
          <strong>Price:</strong> ₹{equipment.price}<br />
          <p>
            <strong>Availability: </strong> 
            <span className={equipment.availability ? 'text-success' : 'text-danger'}>
              {equipment.availability ? 'Available' : 'Not Available'}
            </span>
          </p>
        </p>
        <Link to={`/equipment/${equipment.id}`} className="btn btn-primary">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default EquipmentCard;