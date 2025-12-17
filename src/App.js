import React, { useState } from 'react';
import ReCAPTCHA from 'reaptcha';

const RECAPTCHA_KEY = '6LcahC4sAAAAAESm66Rmu-uo33P66EPG8cf8gzKE';

function App() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleColor: '',
    email: '',
    reason: ''
  });
  const [message, setMessage] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onVerify = (token) => {
    setCaptchaToken(token);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!captchaToken) {
      setMessage('Please complete the reCAPTCHA.');
      return;
    }

    const response = await fetch('/api/submit-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, captchaToken })
    });

    const result = await response.json();
    setMessage(result.success ? 'Request submitted successfully!' : result.error || 'Submission failed.');
    if (result.success) setFormData({
      firstName: '', lastName: '', vehicleMake: '', vehicleModel: '',
      vehicleColor: '', email: '', reason: ''
    });
  };

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
        
        <ReCAPTCHA sitekey={RECAPTCHA_KEY} onVerify={onVerify} />
        <br/>
        <button type="submit">Submit Request</button>
      </form>
      {message && <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{message}</p>}
    </div>
  );
}

export default App;
