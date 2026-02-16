import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; 
import logo from '../assets/images/logo.png';

const ResetPassword = () => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '', token: '', password: '', password_confirmation: ''});

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value })); //previous state
  };

  const handleReset = async (e) => { //Stops page reload
    e.preventDefault();
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/reset-password', formData);
      toast.success(res.data.message);
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <div className="container mt-5">
      <div className="reset-form" style={{ maxWidth: '450px', margin: '0 auto' }}>
        <div className="card border-0 shadow">

        <div className="card-body p-4">
            <div className="d-flex justify-content-center mb-3">
              <img src={logo} alt="Logo" style={{ maxWidth: '150px' }} />
            </div>
            <h3 style={{ color: '#00A36C' }} className="mb-4 text-center">Reset Password</h3>
            <form onSubmit={handleReset}>
              <input type="email" name="email" placeholder="Email" className="form-control mb-3" onChange={handleChange}required/>

              <input type="text" name="token" placeholder="Reset Token" className="form-control mb-3" onChange={handleChange} required/>

              <input type="password" name="password" placeholder="New Password" className="form-control mb-3" onChange={handleChange} required/>

              <input type="password" name="password_confirmation" placeholder="Confirm Password" className="form-control mb-4" onChange={handleChange} required/>

              <button className="btn w-100"
                style={{ backgroundColor: isHovered ? '#00A36C' : '#008000', color: 'white', border: 'none',}}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)} type="submit" >
                Reset Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
