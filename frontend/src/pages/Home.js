// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container mt-5">
      <div className="jumbotron text-center bg-light p-5 rounded">
        <h1 style={{color: 'black'}} className="display-4">Welcome to Medi Link</h1>
        <p style={{color: 'black'}} className="lead">Rent or lend medical equipment with ease.</p>
        <hr className="my-4" />
        <div className="mt-4">
          <Link to="/search" className="btn btn-primary btn-lg me-3">
            Search Equipment
          </Link>
          <Link to="/register" className="btn btn-success btn-lg">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;