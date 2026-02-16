import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Form, Row, Col } from 'react-bootstrap';
import logo from '../assets/images/logo.png';

const Register = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [backendErrors, setBackendErrors] = useState({});
  const navigate = useNavigate();
  const [userType, setUserType] = useState('general_user');
  const [licenseFile, setLicenseFile] = useState(null);

  const { 
    register, handleSubmit, watch, formState: { errors }, setValue,setError,clearErrors } = useForm();
  
  const password = watch('password');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLicenseFile(file);
      setValue('license', file);
    }
  };
  // clear backend errors when switching
  const handleUserTypeChange = (e) => {
    const newUserType = e.target.value;
    setUserType(newUserType);
    setBackendErrors({}); 
    clearErrors(); 
  };

  const onSubmit = async (data) => {
    try {
      setBackendErrors({});
      
      const formData = new FormData();

      formData.append('first_name', data.first_name);
      formData.append('last_name', data.last_name);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('password_confirmation', data.password_confirmation);
      formData.append('user_type', userType);

      if (userType === 'pharmacist') {
        formData.append('pharmacist_name', data.pharmacist_name);
        formData.append('slmc_reg_no', data.slmc_reg_no);
        formData.append('contact_no', data.contact_no);

        if (licenseFile) {
          formData.append('license', licenseFile);
        }
      }

      if (userType === 'nmra_official') {
        formData.append('nmra_id', data.nmra_id);
      }

      const response = await axios.post(
        'http://127.0.0.1:8000/api/register',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
          }
        }
      );

      if (response.data.status) {
        toast.success(response.data.message);
        navigate('/login');
      } else {
        toast.error(response.data.message || 'Registration failed.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        setBackendErrors(validationErrors);
        Object.keys(validationErrors).forEach((fieldName) => {
          setError(fieldName, {
            type: 'manual',
            message: validationErrors[fieldName][0] // Get first error message
          });
        });        
        // Show error messages
        const errorMessages = Object.values(validationErrors)
          .flat() //conver to a single array
          .join(' ');
        toast.error(errorMessages);
      } else {
        toast.error('Server error or network issue.');
      }
    }
  };

  return (
    <main>
      <div className="container mt-5">
        <div className="register-form">
          <div className="card border-0 shadow">
            <div className="card-body p-4 px-5">
              <div className="d-flex justify-content-center mb-3">
                <img src={logo} alt="Logo" style={{ maxWidth: '150px' }} />
              </div>
              <h3 style={{ color: '#008000' }} className="mb-4">Registration</h3>

              <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Form.Group as={Row} className="mb-3 text-start">
                  <Form.Label column sm={4}>First Name</Form.Label>
                  <Col sm={8}>
                    <Form.Control type="text"  isInvalid={!!errors.first_name}
                      {...register('first_name', { required: 'First name is required' })}/>
                    <Form.Control.Feedback type="invalid">
                      {errors.first_name?.message}
                    </Form.Control.Feedback>
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3 text-start">
                  <Form.Label column sm={4}>Last Name</Form.Label>
                  <Col sm={8}>
                    <Form.Control  type="text" isInvalid={!!errors.last_name}
                      {...register('last_name', { required: 'Last name is required' })}/>
                    <Form.Control.Feedback type="invalid">
                      {errors.last_name?.message}
                    </Form.Control.Feedback>
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3 text-start">
                  <Form.Label column sm={4}>Email</Form.Label>
                  <Col sm={8}>
                    <Form.Control type="email"  isInvalid={!!errors.email} {...register('email', {  required: 'Email is required',
                        pattern: {
                          value: /^\S+@\S+$/i, 
                          message: 'Invalid email format' }
                      })} />
                    <Form.Control.Feedback type="invalid">
                      {errors.email?.message}
                    </Form.Control.Feedback>
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3 text-start">
                  <Form.Label column sm={4}>Password</Form.Label>
                  <Col sm={8}>
                    <Form.Control  type="password" isInvalid={!!errors.password}
                      {...register('password', { required: 'Password is required', 
                        minLength: { value: 6, message: 'Minimum 6 characters' } 
                      })} />
                    <Form.Control.Feedback type="invalid">
                      {errors.password?.message}
                    </Form.Control.Feedback>
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3 text-start">
                  <Form.Label column sm={5}>Confirm Password</Form.Label>
                  <Col sm={7}>
                    <Form.Control type="password" isInvalid={!!errors.password_confirmation}
                      {...register('password_confirmation', { required: 'Confirm password is required',
                        validate: val => val === password || 'Passwords do not match'
                      })}/>
                    <Form.Control.Feedback type="invalid">
                      {errors.password_confirmation?.message}
                    </Form.Control.Feedback>
                  </Col>
                </Form.Group>

                <Form.Group as={Row} className="mb-3 text-start">
                  <Form.Label column sm={4}>User Type</Form.Label>
                  <Col sm={8}>
                    <Form.Select value={userType} onChange={handleUserTypeChange}>
                      <option value="general_user">General User</option>
                      <option value="pharmacist">Pharmacist</option>
                      <option value="nmra_official">NMRA Official</option>
                    </Form.Select>
                  </Col>
                </Form.Group>

                {userType === 'pharmacist' && (
                  <>
                    <Form.Group as={Row} className="mb-3 text-start">
                      <Form.Label column sm={5}>Pharmacist Name</Form.Label>
                      <Col sm={7}>
                        <Form.Control type="text" isInvalid={!!errors.pharmacist_name}
                          {...register('pharmacist_name', { required: 'Pharmacist name is required' })} />
                        <Form.Control.Feedback type="invalid">
                          {errors.pharmacist_name?.message}
                        </Form.Control.Feedback>
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3 text-start">
  <Form.Label column sm={4}>SLMC Reg. No</Form.Label>
  <Col sm={8}>
    <Form.Control type="text" isInvalid={!!errors.slmc_reg_no || !!backendErrors.slmc_reg_no}
      {...register('slmc_reg_no', { required: 'SLMC registration number is required.' 
      })}
      onChange={() => {
        if (backendErrors.slmc_reg_no) {
          setBackendErrors(prev => ({ ...prev, slmc_reg_no: null }));
        }
      }}/>
    <Form.Control.Feedback type="invalid">
      {backendErrors.slmc_reg_no 
        ? (backendErrors.slmc_reg_no[0] || 'An account has already been registered with this SLMC number.')
        : errors.slmc_reg_no?.message
      }
    </Form.Control.Feedback>
  </Col>
</Form.Group>
                    <Form.Group as={Row} className="mb-3 text-start">
                      <Form.Label column sm={4}>Contact Number</Form.Label>
                      <Col sm={8}>
                        <Form.Control type="text" isInvalid={!!errors.contact_no}
                          {...register('contact_no', { 
                            required: 'Contact number is required' 
                          })} />
                        <Form.Control.Feedback type="invalid">
                          {errors.contact_no?.message}
                        </Form.Control.Feedback>
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3 text-start">
                      <Form.Label column sm={4}>Pharmacy License</Form.Label>
                      <Col sm={8}>
                        <Form.Control type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} isInvalid={!!errors.license} />
                        <Form.Control.Feedback type="invalid">
                          {errors.license?.message} 
                        </Form.Control.Feedback>
                        {licenseFile && (
                          <div className="mt-2 text-muted small">
                            Selected file: {licenseFile.name}
                          </div>
                        )}
                      </Col>
                    </Form.Group>
                  </>
                )}

                {userType === 'nmra_official' && (
                  <Form.Group as={Row} className="mb-3 text-start">
                    <Form.Label column sm={4}>NMRA ID</Form.Label>
                    <Col sm={8}>
                      <Form.Control type="text" isInvalid={!!errors.nmra_id} {...register('nmra_id', { required: 'NMRA ID is required' })} />
                      <Form.Control.Feedback type="invalid">
                        {errors.nmra_id?.message}
                      </Form.Control.Feedback>
                    </Col>
                  </Form.Group>
                )}

                <button className="btn w-100" style={{ backgroundColor: isHovered ? '#008000' : '#00A300', color: 'white', border: 'none' }} 
                  onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} type="submit">
                  <b>Register</b>
                </button>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Register;