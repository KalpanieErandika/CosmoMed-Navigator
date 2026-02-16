import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isHovered, setIsHovered] = useState(false); 
  const navigate = useNavigate();

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/forgot-password', { email });
      toast.success('Reset link sent! Check your e‑mail.');
      console.log('Reset token:', res.data.token); 
      navigate('/reset-password');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send reset link');
    }
  };

  return (
    <div className="container mt-5">
      <div className="forgot-form">
      <div className="card border-0 shadow p-4">
        <div className="d-flex justify-content-center mb-3">
          <img src={logo} alt="Logo" style={{ maxWidth: '150px' }} />
        </div>

        <h3 style={{ color: '#00A36C' }} className="mb-4 text-center">Forgot Password</h3>

        <form onSubmit={handleSend}>
          <label htmlFor="email" className="mb-2 text-center d-block">Email Address</label>
          <input className="form-control mb-3" placeholder="Enter your Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}required />

          <button className="btn w-100" style={{ backgroundColor: isHovered ? ' #00A36C' : '#008000', color: 'white', border: 'none',
            }} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} type="submit" >
            Send Reset Link
          </button>
        </form>
      </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
