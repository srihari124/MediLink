import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios';

const EquipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [equipment, setEquipment] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalPrice, setTotalPrice] = useState(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successDetails, setSuccessDetails] = useState(null);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    fetchEquipmentDetails();
  }, [id]);

  const fetchEquipmentDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:4004/api/equipments/${id}`);
      setEquipment(response.data);
    } catch (error) {
      console.error('Error fetching equipment details:', error);
      setError('Equipment not found');
    } finally {
      setLoading(false);
    }
  };

  // Recalculate total price whenever dates or price change
  useEffect(() => {
    if (!equipment || !startDate || !endDate) return;
    const days = calculateDays(startDate, endDate);
    const total = days * parseFloat(equipment.price);
    setTotalPrice(total.toFixed(2));
  }, [startDate, endDate, equipment]);

  useEffect(() => {
    if (startDate && endDate) {
      // Only check availability if we have both dates
      // This prevents unnecessary API calls
      checkAvailability();
    }
  }, [startDate, endDate]);

  const calculateDays = (start, end) => {
    const startObj = new Date(start);
    const endObj = new Date(end);
    const diffMs = endObj - startObj;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1;
  };

  const checkAvailability = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:4004/api/bookings/${id}/availability`, {
        params: { startDate, endDate },
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Availability check result:', res.data);
      setEquipment((prev) => ({ ...prev, availability: res.data }));
    } catch (err) {
      console.error('Error checking equipment availability:', err);
      // If availability check fails, don't update the equipment state
      // This prevents the UI from breaking if the endpoint doesn't exist
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true); 
        return;
      }
  
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (new Date(endDate) < new Date(startDate)) {
      setBookingError('End date must be on or after start date.');
      return;
    }
    if (!user) {
      setBookingError('You must be logged in to book equipment.');
      return;
    }
    if (!totalPrice || isNaN(totalPrice)) {
      setBookingError('Please select valid dates to calculate the total price.');
      return;
    }
    if (!equipment.availability) {
      setBookingError('This equipment is not available for selected dates.');
      return;
    }

    setBookingError('');
    try {
      setBookingInProgress(true);
      const token = localStorage.getItem('token');
      // Ensure totalPrice is a number
      const bookingData = {
        equipmentId: id,
        userId: user.id || user.sub,
        equipmentName: equipment.name,
        startDate,
        endDate,
        price: parseFloat(totalPrice),
        status: 'CONFIRMED',
      };

      const bookingRes = await axios.post('http://localhost:4004/api/bookings', bookingData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const bookingId = bookingRes.data.id;

    

      const paymentOrderRes = await fetchPaymentOrderWithRetry(bookingId, token);

      const paymentOrder = paymentOrderRes.data;
      console.log('Payment order from backend:', paymentOrder);
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setBookingError('Razorpay SDK failed to load.');
        return;
      }

      const rzp = new window.Razorpay({
        key: 'rzp_test_TlWoJr83uENQYN',
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: 'MediLink',
        description: 'Equipment Booking Payment',
        order_id: paymentOrder.razorpayOrderId,
        handler: async function (response) {
          const orderId = response.razorpay_order_id;
          const paymentId = response.razorpay_payment_id;
          const signature = response.razorpay_signature;

          if(!orderId || !paymentId || !signature) {
            setBookingError('Payment failed. Please try again.');
            return;
          }

          try{
            await axios.post('http://localhost:4004/api/payments/verify-payment', {
              orderId: orderId,
              paymentId: paymentId,
              signature: signature,
            }, {
              headers: { Authorization: `Bearer ${token}` },
            });

            setSuccessDetails({
              equipmentName: equipment.name,
              startDate,
              endDate
            });

            await checkAvailability();
            setStartDate('');
            setEndDate('');
            setTotalPrice(null);

          } catch (err) {
            console.error('Error verifying payment:', err);
            setBookingError('Payment verification failed. Please try again.');
          }
        },
        prefill: {
          name: user.name || '',
          email: user.email || '',
        },
        theme: { color: '#3f51b5' },
      });

      rzp.open();

      rzp.on('payment.failed', function (response) {
        console.error('❌ Razorpay payment failed:', response.error);
        setBookingError('Payment failed. Please try again.');
      });

    } catch (err) {
      console.error('Error booking equipment:', err);
      setBookingError('Booking failed. Please try again.');
    } finally {
      setBookingInProgress(false);
    }
  };

  async function fetchPaymentOrderWithRetry(bookingId, token, retries = 5, delay = 500) {
    for (let i = 0; i < retries; i++) {
      try {
        return await axios.get(`http://localhost:4004/api/payments/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        if (err.response && err.response.status === 404 && i < retries - 1) {
          await new Promise(res => setTimeout(res, delay));
        } else {
          throw err;
        }
      }
    }
  }

  if (loading) {
    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <h5 className="text-muted">Loading equipment details...</h5>
          </div>
        </div>
    );
  }

  if (error || !equipment) {
    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-md-6">
                <div className="modern-card text-center p-5">
                  <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '4rem' }}></i>
                  <h4 className="text-danger mt-3">Equipment Not Found</h4>
                  <p className="text-muted mb-4">The equipment you're looking for doesn't exist or has been removed.</p>
                  <button
                      className="btn btn-gradient-primary"
                      onClick={() => navigate('/search')}
                  >
                    <i className="bi bi-search me-2"></i>Browse Equipment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  }

  return (
    <div className="min-vh-100" style={{
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div className="container py-5">
        {/* Modern Success Card */}
        {successDetails && (
          <div className="card shadow-lg border-success mb-4 p-3 text-center animate__animated animate__fadeIn" style={{ maxWidth: 600, margin: '0 auto' }}>
            <div className="mb-2">
              <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '2.2rem' }}></i>
            </div>
            <h5 className="fw-bold text-success mb-2">Booking Confirmed!</h5>
            <p className="mb-2" style={{ fontSize: '1rem' }}>
              <strong>{successDetails.equipmentName}</strong> is booked from <strong>{successDetails.startDate}</strong> to <strong>{successDetails.endDate}</strong>.
            </p>
            <button
              className="btn mt-2 px-4 py-2 fw-semibold"
              style={{ fontSize: '1rem', borderRadius: '8px', background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', border: 'none', color: '#fff', boxShadow: '0 2px 8px rgba(102,126,234,0.15)' }}
              onClick={() => navigate('/bookings')}
            >
              Go to My Bookings
            </button>
          </div>
        )}
        {/* Modern Error Banner */}
        {bookingError && (
          <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {bookingError}
            <button type="button" className="btn-close" onClick={() => setBookingError('')} aria-label="Close"></button>
          </div>
        )}

        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <button className="btn btn-link p-0 text-decoration-none" onClick={() => navigate('/')}>
                Home
              </button>
            </li>
            <li className="breadcrumb-item">
              <button className="btn btn-link p-0 text-decoration-none" onClick={() => navigate('/search')}>
                Search
              </button>
            </li>
            <li className="breadcrumb-item active" aria-current="page">Equipment Details</li>
          </ol>
        </nav>

        <div className="row g-5">
          {/* Equipment Info */}
          <div className="col-lg-8">
            <div className="modern-card overflow-hidden" style={{ animation: 'fadeInUp 0.8s ease' }}>
              {/* Header Image */}
              <div
                  className="position-relative text-center text-white"
                  style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    padding: '4rem 2rem'
                  }}
              >
                <div className="position-absolute top-0 end-0 m-4">
                <span className={`badge ${equipment.availability ? 'status-available' : 'status-rented'} px-3 py-2`}>
                  <i className={`bi ${equipment.availability ? 'bi-check-circle' : 'bi-clock'} me-1`}></i>
                  {equipment.availability ? 'Available' : 'Currently Rented'}
                </span>
                </div>

                <h1 className="fw-bold mb-3">{equipment.name}</h1>
                <p className="lead opacity-75 mb-0">Professional Medical Equipment</p>
              </div>

              {/* Equipment Details */}
              <div className="p-5">
                <div className="row g-4 mb-5">
                  <div className="col-md-4">
                    <div className="d-flex align-items-center p-4 rounded-3" style={{ background: '#f8f9fa' }}>
                      <div
                          className="d-flex align-items-center justify-content-center me-3"
                          style={{
                            width: '50px',
                            height: '50px',
                            background: '#667eea20',
                            borderRadius: '12px'
                          }}
                      >
                        <i className="bi bi-grid-3x3-gap text-primary" style={{ fontSize: '1.5rem' }}></i>
                      </div>
                      <div>
                        <div className="small text-muted">Equipment Type</div>
                        <div className="fw-semibold">{equipment.type}</div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="d-flex align-items-center p-4 rounded-3" style={{ background: '#f8f9fa' }}>
                      <div
                          className="d-flex align-items-center justify-content-center me-3"
                          style={{
                            width: '50px',
                            height: '50px',
                            background: '#28a74520',
                            borderRadius: '12px'
                          }}
                      >
                        <i className="bi bi-geo-alt text-success" style={{ fontSize: '1.5rem' }}></i>
                      </div>
                      <div>
                        <div className="small text-muted">Location</div>
                        <div className="fw-semibold">{equipment.location}</div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="d-flex align-items-center p-4 rounded-3" style={{ background: '#f8f9fa' }}>
                      <div
                          className="d-flex align-items-center justify-content-center me-3"
                          style={{
                            width: '50px',
                            height: '50px',
                            background: '#ffc10720',
                            borderRadius: '12px'
                          }}
                      >
                        <i className="bi bi-currency-rupee text-warning" style={{ fontSize: '1.5rem' }}></i>
                      </div>
                      <div>
                        <div className="small text-muted">Daily Rate</div>
                        <div className="fw-bold text-success fs-5">₹{equipment.price}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex gap-3">
                  {equipment.availability ? (
                      <>
                        <button
                          className="btn btn-success px-4 py-3 flex-grow-1"
                          style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                            transition: 'all 0.3s ease'
                          }}
                          onClick={() => document.getElementById('bookingForm').scrollIntoView({ behavior: 'smooth' })}
                          disabled={!user}
                        >
                          <i className="bi bi-calendar-plus me-2"></i>
                          Book Equipment
                        </button>
                        {!user && (
                            <button
                                className="btn btn-outline-primary px-4 py-3"
                                onClick={() => navigate('/login')}
                            >
                              <i className="bi bi-box-arrow-in-right me-2"></i>
                              Login to Book
                            </button>
                        )}
                      </>
                  ) : (
                      <button className="btn btn-secondary px-4 py-3 flex-grow-1" disabled>
                        <i className="bi bi-clock me-2"></i>
                        Currently Unavailable
                      </button>
                  )}
                  <button
                      className="btn btn-outline-secondary px-4 py-3"
                      onClick={() => navigate('/search')}
                  >
                    <i className="bi bi-search me-2"></i>
                    Browse More
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form Sidebar */}
          <div className="col-lg-4">
            {/* Hide booking form if success */}
            {!successDetails && (
              <div id="bookingForm" className="modern-card p-4 sticky-top" style={{
                top: '100px',
                animation: 'slideInRight 0.8s ease 0.3s both'
              }}>
                <h5 className="fw-bold mb-4">
                  <i className="bi bi-calendar-check me-2 text-primary"></i>
                  Book This Equipment
                </h5>
                <form onSubmit={handleBooking}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Start Date</label>
                    <input
                        type="date"
                        className="modern-form-control form-control"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">End Date</label>
                    <input
                        type="date"
                        className="modern-form-control form-control"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || new Date().toISOString().split('T')[0]}
                        required
                    />
                  </div>

                  {/* Pricing Summary */}
                  {totalPrice && (
                      <div className="mb-4 p-3 rounded-3" style={{ background: '#f8f9fa' }}>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Duration:</span>
                          <span className="fw-semibold">{calculateDays(startDate, endDate)} days</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Daily Rate:</span>
                          <span>₹{equipment.price}</span>
                        </div>
                        <hr className="my-2" />
                        <div className="d-flex justify-content-between">
                          <span className="fw-semibold">Total:</span>
                          <span className="fw-bold text-success fs-5">₹{totalPrice}</span>
                        </div>
                      </div>
                  )}

                  <div className="d-flex gap-2">
                    <button
                        type="button"
                        className="btn btn-outline-secondary flex-grow-1"
                        onClick={() => {
                          setStartDate('');
                          setEndDate('');
                          setTotalPrice(null);
                        }}
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      className="btn btn-success flex-grow-1"
                      style={{
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                        transition: 'all 0.3s ease'
                      }}
                      disabled={bookingInProgress || calculateDays(startDate, endDate) <= 0 || !equipment.availability}
                    >
                      {bookingInProgress ? (
                        <span className="spinner-border spinner-border-sm me-2"></span>
                      ) : (
                        <i className="bi bi-check-lg me-2"></i>
                      )}
                      {bookingInProgress ? 'Processing...' : 'Book Now'}
                    </button>
                  </div>

                  {!equipment.availability && (
                      <div className="alert alert-warning border-0 rounded-3 mt-3">
                        <i className="bi bi-info-circle me-2"></i>
                        This equipment is currently rented
                      </div>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetails;