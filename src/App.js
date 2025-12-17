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
          setFormData({ firstName: '', lastName: '', vehicleMake: '', vehicleModel: '', vehicleColor: '', email: '', reason: '' });
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
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '30px', background: '#fff', border: '1px solid #C8102E', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <img src="https://www.marines.mil/Portals/_default/Skins/USMC/images/USMC_EGA.png" alt="U.S. Marine Corps Eagle, Globe, and Anchor" style={{ height: '120px' }} />
        <h1 style={{ color: '#C8102E', margin: '20px 0 10px' }}>Marine Corps Installations East</h1>
        <h2 style={{ color: '#333', margin: '0' }}>Restricted Area Access Request</h2>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Form fields same as before */}
        <input name="firstName" type="text" placeholder="First Name *" value={formData.firstName} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }} /><br/>
        <input name="lastName" type="text" placeholder="Last Name *" value={formData.lastName} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }} /><br/>
        <input name="vehicleMake" type="text" placeholder="Vehicle Make" value={formData.vehicleMake} onChange={handleChange} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }} /><br/>
        <input name="vehicleModel" type="text" placeholder="Vehicle Model" value={formData.vehicleModel} onChange={handleChange} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }} /><br/>
        <input name="vehicleColor" type="text" placeholder="Vehicle Color" value={formData.vehicleColor} onChange={handleChange} style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }} /><br/>
        <input name="email" type="email" placeholder="Email *" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }} /><br/>
        <textarea name="reason" placeholder="Reason for Access *" rows="5" value={formData.reason} onChange={handleChange} required style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }} /><br/>

        <button type="submit" disabled={loading} style={{ padding: '12px 30px', background: '#C8102E', color: '#FFB81C', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' }}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>

      {message && <p style={{ marginTop: '20px', fontWeight: 'bold', color: message.includes('success') ? 'green' : 'red' }}>{message}</p>}

      <div style={{ textAlign: 'center', marginTop: '40px', fontSize: '12px', color: '#666' }}>
        Official U.S. Marine Corps Restricted Area Access Form<br/>
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
