import React, { useState, useCallback } from 'react';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import './App.css';

const SITE_KEY = '6LeeyS4sAAAAAO8sYkIOvR_BpzrW4koXSCnjwtsl';

const AccessRequestForm = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleColor: '',
    email: '',
    reason: '',
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setMessage('');
      setLoading(true);

      if (!executeRecaptcha) {
        setMessage('reCAPTCHA is not loaded. Please wait a moment and try again.');
        setLoading(false);
        return;
      }

      try {
        const token = await executeRecaptcha('submit_request');

        const response = await fetch('/api/submit-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, captchaToken: token }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setMessage('Request submitted successfully!');
          setFormData({
            firstName: '',
            lastName: '',
            vehicleMake: '',
            vehicleModel: '',
            vehicleColor: '',
            email: '',
            reason: '',
          });
        } else {
          setMessage(result.error || result.message || 'Submission failed.');
        }
      } catch (err) {
        setMessage('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [executeRecaptcha, formData]
  );

  return (
    <div className="form-container">

      <div className="form-header">
        <img
          src="https://api.dvidshub.net/api/images/organization/MCIEAST/logo"
          alt="Marine Corps Installations East Official Seal"
          className="form-logo"
        />
        <h1 className="form-title">Marine Corps Installations East</h1>
        <h2 className="form-subtitle">Restricted Area Access Request</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          name="firstName"
          type="text"
          placeholder="First Name *"
          value={formData.firstName}
          onChange={handleChange}
          required
          className="form-input"
        />
        <input
          name="lastName"
          type="text"
          placeholder="Last Name *"
          value={formData.lastName}
          onChange={handleChange}
          required
          className="form-input"
        />
        <input
          name="vehicleMake"
          type="text"
          placeholder="Vehicle Make"
          value={formData.vehicleMake}
          onChange={handleChange}
          className="form-input"
        />
        <input
          name="vehicleModel"
          type="text"
          placeholder="Vehicle Model"
          value={formData.vehicleModel}
          onChange={handleChange}
          className="form-input"
        />
        <input
          name="vehicleColor"
          type="text"
          placeholder="Vehicle Color"
          value={formData.vehicleColor}
          onChange={handleChange}
          className="form-input"
        />
        <input
          name="email"
          type="email"
          placeholder="Email *"
          value={formData.email}
          onChange={handleChange}
          required
          className="form-input"
        />
        <textarea
          name="reason"
          placeholder="Reason for Access *"
          rows="5"
          value={formData.reason}
          onChange={handleChange}
          required
          className="form-textarea"
        />

        <button type="submit" disabled={loading} className="form-button">
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>

      {message && (
        <p className={`form-message ${message.includes('success') ? 'form-message--success' : 'form-message--error'}`}>
          {message}
        </p>
      )}

      <div className="form-footer">
        Official U.S. Marine Corps Restricted Area Access Form<br />
        For questions, contact your unit security officer.
      </div>

    </div>
  );
};

function App() {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={SITE_KEY}>
      <AccessRequestForm />
    </GoogleReCaptchaProvider>
  );
}

export default App;
