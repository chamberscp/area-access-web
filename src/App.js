import React, { useState, useCallback } from 'react';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

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
        setMessage('reCAPTCHA is not loaded. Please wait and try again.');
        setLoading(false);
        return;
      }

      try {
        const token = await executeRecaptcha('submit_request');

        const response = await fetch('/api/submit-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            captchaToken: token,
          }),
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
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Area Access Request</h1>
      <form onSubmit={handleSubmit}>
        <input
          name="firstName"
          type="text"
          placeholder="First Name *"
          value={formData.firstName}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <input
          name="lastName"
          type="text"
          placeholder="Last Name *"
          value={formData.lastName}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <input
          name="vehicleMake"
          type="text"
          placeholder="Vehicle Make"
          value={formData.vehicleMake}
          onChange={handleChange}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <input
          name="vehicleModel"
          type="text"
          placeholder="Vehicle Model"
          value={formData.vehicleModel}
          onChange={handleChange}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <input
          name="vehicleColor"
          type="text"
          placeholder="Vehicle Color"
          value={formData.vehicleColor}
          onChange={handleChange}
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <input
          name="email"
          type="email"
          placeholder="Email *"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <textarea
          name="reason"
          placeholder="Reason for Access *"
          rows="5"
          value={formData.reason}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '12px 24px', fontSize: '16px' }}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
      {message && (
        <p style={{ marginTop: '20px', fontWeight: 'bold', color: message.includes('success') ? 'green' : 'red' }}>
          {message}
        </p>
      )}
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
