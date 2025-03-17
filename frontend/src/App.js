import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './pages/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Search from './pages/Search';
import EquipmentDetails from './pages/EquipmentDetails';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Logout from './pages/Logout';
import Register from './pages/Register';
import Bookings from './pages/Booking';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import './App.css';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div
          className="d-flex flex-column min-vh-100"
          style={{
            backgroundImage: `url(${process.env.PUBLIC_URL + '/background2.jpg'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
            minHeight: '100vh',
          }}
        >
          <Navbar />
          <div className="flex-grow-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/equipment/:id" element={<EquipmentDetails />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/logout" element={<Logout />} />
              <Route path="/register" element={<Register />} />
              <Route path="/bookings" element={<Bookings />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
