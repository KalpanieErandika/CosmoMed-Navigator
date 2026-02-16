import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserCircle, FaEnvelope, FaPhone, FaShieldAlt, FaCalendarAlt,FaMobileAlt,FaSave,FaUndo,FaCheckCircle,FaExclamationCircle,FaInfoCircle,FaExclamationTriangle} from 'react-icons/fa';
import { BiLoaderAlt } from 'react-icons/bi';
import { toast } from "react-toastify";

const PharmacistAccount = () => {
  const [userData, setUserData] = useState(null);
  const [contactNo, setContactNo] = useState('');
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPharmacistData();
  }, []);

  const fetchPharmacistData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get("http://127.0.0.1:8000/api/user", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setUserData(response.data);
      setContactNo(response.data.contact_no || '');
      setError('');
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load pharmacist data: ' + (err.response?.data?.message || err.message || 'Connection error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        "http://127.0.0.1:8000/api/pharmacist/contact", 
        { contact_no: contactNo },
        {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success('Contact number updated successfully!');
      setMessage('Contact number updated successfully!');
      
      if (userData) {
        setUserData({
          ...userData,
          contact_no: contactNo
      });
      }
      
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Update failed';
      toast.error(errorMsg);
      setError(errorMsg);
      console.error('Error:', err);
    } finally {
      setUpdateLoading(false);
    }
  };

  if (error && !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 py-4 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl border-red-200 p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <FaExclamationTriangle className="text-red-500 text-xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Failed to Load Data</h3>
            </div>
            <div className="p-4 bg-red-100 border-2 border-red-400 rounded-lg mb-6">
              <p className="text-red-700">{error}</p>
            </div>
            <button onClick={fetchPharmacistData} className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-full bg-gradient-to-br from-blue-50 to-green-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-8 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-yellow-300">
              <FaInfoCircle className="text-3xl text-yellow-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No Data Available</h3>
            <p className="text-gray-600 mb-6">Unable to load pharmacist information.</p>
            
      </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8 px-4">
      <div className="max-w-4xl mx-auto ">
        
        <div className="mb-2 text-center max-w-2xl mx-auto ">
  <h1 className="text-3xl font-bold text-gray-800  bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
    Pharmacist Account
  </h1>
  <p className="text-gray-600 text-lg">
    Manage your contact details
  </p>
</div>

        <div className="bg-white rounded-xl shadow-lg border border-yellow-200 overflow-hidden mb-4">
       <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-1 mb-3">

              <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
    <div className="text-xs font-semibold text-gray-600 mb-1">First Name</div>
    <div className="text-sm font-medium text-gray-800">{userData.first_name}</div>
  </div>

  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
    <div className="text-xs font-semibold text-gray-600 mb-1">Last Name</div>
    <div className="text-sm font-medium text-gray-800">{userData.last_name}</div>
  </div>

  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
    <div className="text-xs font-semibold text-gray-600 mb-1">Email</div>
    <div className="text-sm font-medium text-gray-800 truncate">{userData.email}</div>
  </div>

  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
    <div className="text-xs font-semibold text-gray-600 mb-1">Pharmacist Name</div>
    <div className="text-sm font-medium text-gray-800">{userData.pharmacist_name }</div>
  </div>

  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
    <div className="text-xs font-semibold text-gray-600 mb-1">SLMC Registration No</div>
    <div className="text-sm font-medium text-gray-800">{userData.slmc_reg_no}</div>
  </div>

  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
    <div className="text-xs font-semibold text-gray-600 mb-1">Account Status</div>
    <span className={`inline-block px-2 py-1 rounded-full font-medium border text-xs ${getStatusColor(userData.pharmacist_status)}`}>
      {userData.pharmacist_status?.toUpperCase()}
    </span>
  </div>

  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
    <div className="text-xs font-semibold text-gray-600 mb-1">Pharmacy ID</div>
    <div className="text-sm font-medium text-gray-800">{userData.pharmacy_id || 'Not assigned'}</div>
  </div>
</div>

          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Update Contact Information</h2>
            </div>
            <p className="text-gray-600 mb-6"> Update your personal contact number below. </p>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Contact Number
                  </label>
                  <div className="relative">
                    <input type="text" value={contactNo} onChange={(e) => setContactNo(e.target.value)} placeholder="07XXXXXXXX " className="w-full px-4 py-3 border-2 border-yellow-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all placeholder-gray-400 hover:border-yellow-500" required/>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    Format: 07XXXXXXXX
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button type="submit" disabled={updateLoading || contactNo === userData.contact_no} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl">
                    {updateLoading ? 'Updating...' : 'Update Contact No'}
                  </button>

                  <button type="button" onClick={() => setContactNo(userData.contact_no || '')} disabled={!userData.contact_no} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed">
                    Clear
                  </button>
                </div>
              </div>
            </form>
          </div>

          </div>
        </div>
      </div>
      </div>
  );
};

export default PharmacistAccount;