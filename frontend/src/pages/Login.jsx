import React, { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from './context/Auth1';
import logo from '../assets/images/logo.png';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/authenticate', data, {
        headers: { 'Content-Type': 'application/json' }
      });

      const result = response.data;

      if (result.status) {
        login(result.user, result.token); //receive the user info and token
        toast.success('Login successful!');

        const routeMap = {
          pharmacist: '/pharmacist-home',
          nmra_official: '/nmra-home',
          default: '/user-home'
        };

        navigate(routeMap[result.user.user_type] || routeMap.default);
      } else {
        toast.error(result.message || 'Login failed.');
      }
    } catch (error) {
      const messages = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(' ')
        : error.response?.data?.message || 'Server error.';
      toast.error(messages);
    }
  };

  return (
    <main className="container mt-5">
      <div className="login-form">
        <div className="card border-0 shadow">
          <div className="card-body">
            <div className="d-flex justify-content-center mb-3">
              <img src={logo} alt="Logo" style={{ maxWidth: '150px' }} />
            </div>

            <h3 style={{ color: '#008000' }} className="mb-4">Login</h3>

            <form onSubmit={handleSubmit(onSubmit)}>

              <div className="mb-3">
                <label>Email</label>
                <input type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  {...register('email', { required: 'Email is required' })}/>
                {errors.email && <p className="text-danger">{errors.email.message}</p>}
              </div>

              <div className="mb-3">
                <label>Password</label>
                <input type="password" className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  {...register('password', { required: 'Password is required' })} />
                {errors.password && <p className="text-danger">{errors.password.message}</p>}
              </div>

              <div className="text-center mt-4">
                <button type="submit" className="btn w-100" onMouseEnter={() => setIsHovered(true)}
onMouseLeave={() => setIsHovered(false)} style={{ backgroundColor: isHovered ? '#008000' : '#00A300', color: 'white', border: 'none' }}>
                  <b>Login</b>
                </button>
              </div>

              <div className="mt-4 text-center">
                <span>Don't have an account? </span>
                <Link to="/register">Register here</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
