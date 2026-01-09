import React from 'react';

const EditModal = ({ show, onClose, onSubmit, formData, onChange }) => {
    if (!show) return null;

    return (
        <div className="modal fade show" style={{
            display: 'block',
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(5px)',
            zIndex: 1050
        }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content modern-card border-0" style={{
                    animation: 'fadeInUp 0.3s ease',
                    boxShadow: 'var(--shadow-lg)'
                }}>
                    <div className="modal-header border-0 pb-2">
                        <h5 className="modal-title fw-bold">
                            <i className="bi bi-pencil-square text-primary me-2"></i>
                            Edit Equipment
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            style={{ transition: 'transform 0.2s ease' }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'rotate(90deg)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'rotate(0)'}
                        ></button>
                    </div>
                    <form onSubmit={onSubmit}>
                        <div className="modal-body px-4 py-3">
                            <div className="mb-3">
                                <label className="form-label fw-semibold">
                                    <i className="bi bi-hospital text-primary me-2"></i>
                                    Equipment Name
                                </label>
                                <input
                                    type="text"
                                    className="modern-form-control form-control"
                                    name="name"
                                    value={formData.name}
                                    onChange={onChange}
                                    placeholder="Enter equipment name"
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold">
                                    <i className="bi bi-grid text-primary me-2"></i>
                                    Equipment Type
                                </label>
                                <input
                                    type="text"
                                    className="modern-form-control form-control"
                                    name="type"
                                    value={formData.type}
                                    onChange={onChange}
                                    placeholder="Enter equipment type"
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold">
                                    <i className="bi bi-geo-alt text-success me-2"></i>
                                    Location
                                </label>
                                <input
                                    type="text"
                                    className="modern-form-control form-control"
                                    name="location"
                                    value={formData.location}
                                    onChange={onChange}
                                    placeholder="Enter location"
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold">
                                    <i className="bi bi-currency-rupee text-warning me-2"></i>
                                    Daily Rental Price (₹)
                                </label>
                                <input
                                    type="number"
                                    className="modern-form-control form-control"
                                    name="price"
                                    value={formData.price}
                                    onChange={onChange}
                                    placeholder="Enter price per day"
                                    step="0.01"
                                    min="0"
                                    required
                                />
                            </div>
                            <div className="mb-3 form-check d-flex align-items-center gap-2 ps-0">
                                <div
                                    className="form-check form-switch"
                                    style={{ transform: 'scale(1.2)', transformOrigin: 'left center' }}
                                >
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="availabilitySwitch"
                                        name="availability"
                                        checked={formData.availability}
                                        onChange={onChange}
                                        role="switch"
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <label
                                        className="form-check-label fw-semibold"
                                        htmlFor="availabilitySwitch"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        Available for Rent
                                    </label>
                                </div>
                                <span className={`badge ms-2 ${formData.availability ? 'status-available' : 'status-rented'}`}>
                  {formData.availability ? 'Available' : 'Unavailable'}
                </span>
                            </div>
                        </div>
                        <div className="modal-footer border-0 pt-2">
                            <button
                                type="button"
                                className="btn btn-outline-secondary px-4"
                                onClick={onClose}
                            >
                                <i className="bi bi-x-lg me-2"></i>
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-gradient-primary px-4"
                            >
                                <i className="bi bi-check-lg me-2"></i>
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Use keyframes for modal animation
const modalStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Add styles to document
if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.textContent = modalStyles;
    document.head.appendChild(styleElement);
}

export default React.memo(EditModal);