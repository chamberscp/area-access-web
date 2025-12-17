import React, { useState, useCallback } from 'react';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const RECAPTCHA_KEY = '6Lcxmy4sAAAAAFNf-2r9_fnfmzaLZsxbIiylEUab';

const FormComponent = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', vehicleMake: '', vehicleModel: '',
    vehicleColor: '', email: '', reason: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!executeRecaptcha) {
      setMessage('reCAPTCHA not loaded yet.');
      return;
    }

    const token = await executeRecaptcha('submit_request');
    const response = await fetch('/api/submit-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, captchaToken: token })
    });

    const result = await response.json();
    setMessage(result.success ? 'Request submitted successfully!' : result.error || 'Submission failed.');
    if (result.success) {
      setFormData({ firstName: '', lastName: '', vehicleMake: '', vehicleModel: '',
        vehicleColor: '', email: '', reason: '' });
    }
  }, [executeRecaptcha, formData]);

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'Arial' }}>
      <h1>Area Access Request</h1>
      <form onSubmit={handleSubmit}>
        <input name="firstName" placeholder="First Name *" value={formData.firstName} onChange={handleChange} required /><br/><br/>
        <input name="lastName" placeholder="Last Name *" value={formData.lastName} onChange={handleChange} required /><br/><br/>
        <input name="vehicleMake" placeholder="Vehicle Make" value={formData.vehicleMake} onChange={handleChange} /><br/><br/>
        <input name="vehicleModel" placeholder="Vehicle Model" value={formData.vehicleModel} onChange={handleChange} /><br/><br/>
        <input name="vehicleColor" placeholder="Vehicle Color" value={formData.vehicleColor} onChange={handleChange} /><br/><br/>
        <input name="email" type="email" placeholder="Email *" value={formData.email} onChange={handleChange} required /><br/><br/>
        <textarea name="reason" placeholder="Reason for Access *" rows="5" value={formData.reason} onChange={handleChange} required /><br/><br/>
        <button type="submit">Submit Request</button>
      </form>
      {message && <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
};

function App() {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_KEY}>
      <FormComponent />
    </GoogleReCaptchaProvider>
  );
}

export default App;
