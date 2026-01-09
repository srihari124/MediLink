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
          <div className="app-container">
            <Navbar />
            <main className="main-content">
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
            </main>
          </div>
        </AuthProvider>
      </Router>
  );
};

export default App;

