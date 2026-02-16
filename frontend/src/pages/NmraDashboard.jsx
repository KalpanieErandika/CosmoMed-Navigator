import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, PieChart, Pie,Cell} from "recharts";
import axios from "axios";
import { FaUsers, FaArrowRight, FaUserCheck, FaUserTimes, FaClock, FaExclamationTriangle } from "react-icons/fa";
import {  FaPills, FaFlask, FaBoxes,FaCapsules,FaVial,FaRedo} from "react-icons/fa";
import { AuthContext } from './context/Auth1';
import { GiChemicalDrop } from "react-icons/gi";
import { Spinner } from "react-bootstrap";

const createApi = (token) => {
  const instance = axios.create({
    baseURL: 'http://127.0.0.1:8000',
    withCredentials: true,
  });

  instance.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      config.headers['Accept'] = 'application/json';
      config.headers['Content-Type'] = 'application/json';
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.log('401 Unauthorized - clearing auth data');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

const NMRADashboard = () => {
  const { user, token: authToken } = useContext(AuthContext);
  const [statistics, setStatistics] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });

  const [productCounts, setProductCounts] = useState({
    medicines: 5410,
    cosmetics: 3436,
    borderline: 320,
    narcotics: 8,
    precursors: 23,
    psychotropics: 19
  });

  const [loading, setLoading] = useState(true);
  const [productLoading, setProductLoading] = useState(false); 
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const api = createApi(authToken);

  useEffect(() => {
    console.log('NMRADashboard - Auth State:', {
      user: user?.user_type,
      token: authToken ? 'Present' : 'Missing'
    });

    if (!user || !authToken) {
      console.log('No user or token - redirecting to login');
      window.location.href = '/login';
      return;
    }

    if (user.user_type !== 'nmra_official') {
      console.log('Wrong user type:', user.user_type);
      const redirectMap = {
        pharmacist: '/pharmacist-home',
        general_user: '/user-home',
      };
      window.location.href = redirectMap[user.user_type] || '/login';
      return;
    }

    console.log('User is NMRA official, fetching dashboard data...');
    fetchStatistics();

  }, [user, authToken]);

  const ensureCsrfToken = async () => {
    try {
      await api.get('/sanctum/csrf-cookie');
      console.log('CSRF token set');
      return true;
    } catch (error) {
      console.error('CSRF token error:', error);
      return false;
    }
  };

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const csrfSuccess = await ensureCsrfToken();
      if (!csrfSuccess) {
        setError('Failed to set CSRF token');
        return;
      }

      console.log('Fetching dashboard statistics...');

      const [pendingResponse, approvedResponse, rejectedResponse] = await Promise.all([
        api.get('/api/nmra/revoked-pharmacists'),
        api.get('/api/nmra/approved-pharmacists'),
        api.get('/api/nmra/rejected-pharmacists'),
        api.get('/api/nmra/revoked-pharmacists')
      ]);

      const pendingCount = pendingResponse.data.data?.length || 0;
      const approvedCount = approvedResponse.data.data?.length || 0;
      const rejectedCount = rejectedResponse.data.data?.length || 0;
      const revokedCount = revokedResponse.data.data?.length || 0;
      const totalCount = pendingCount + approvedCount + rejectedCount;

      console.log('Dashboard counts:', { totalCount, approvedCount, pendingCount, rejectedCount });

      setStatistics({
        total: totalCount,
        approved: approvedCount,
        pending: pendingCount,
        rejected: rejectedCount,
        revoked: revokedCount
      });

    } catch (error) {
      console.error("Error fetching dashboard statistics:", error);
      setError(`Error fetching statistics: ${error.message}`);
      
      if (error.response?.status === 401) {
        console.log('401 Unauthorized - token might be invalid');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (error.response?.status === 403) {
        console.log('Access denied for dashboard');
      } else if (error.code === 'ERR_NETWORK') {
        console.log('Network error - server might be down');
      }

      setStatistics({
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // mock data
  const fetchProductCounts = async () => {
    try {
      setProductLoading(true);
      setError(null);
      
      console.log('Using mock data for product counts...');
      
      const mockCounts = {
        medicines: 1250,    
        cosmetics: 850,     
        borderline: 320,
        narcotics: 45,     
        precursors: 78,   
        psychotropics: 62   
      };
 
      const variedCounts = Object.entries(mockCounts).reduce((acc, [key, value]) => {
        const variation = Math.floor(value * 0.05 * (Math.random() - 0.5));
        acc[key] = Math.max(1, value + variation);
        return acc;
      }, {});
      
      setProductCounts(variedCounts);
      console.log('Mock product counts set:', variedCounts);
      
    } catch (error) {
      console.error("Error in fetchProductCounts:", error);
    } finally {
      setProductLoading(false);
    }
  };

  const refreshAllData = () => {
    setLoading(true);
    setProductLoading(true);
    setError(null);
    fetchStatistics();
    fetchProductCounts();
  };

  const pharmacistStatusData = [
    { name: 'Approved', value: statistics.approved, color: '#10b981' },
    { name: 'Pending', value: statistics.pending, color: '#f59e0b' },
    { name: 'Rejected', value: statistics.rejected, color: '#ef4444' }
  ];

  const productData = [
    { name: 'Medicines', count: productCounts.medicines, color: '#3b82f6' },
    { name: 'Cosmetics', count: productCounts.cosmetics, color: '#8b5cf6' },
    { name: 'Borderline', count: productCounts.borderline, color: '#f59e0b' },
    { name: 'Narcotics', count: productCounts.narcotics, color: '#ef4444' },
    { name: 'Precursors', count: productCounts.precursors, color: '#10b981' },
    { name: 'Psychotropics', count: productCounts.psychotropics, color: '#ec4899' }
  ];

  const totalProducts = Object.values(productCounts).reduce((sum, count) => sum + count, 0);

return (
  <div className="space-y-8 p-4 md:p-6">
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-800">NMRA Dashboard</h1>
    </div>

    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Pharmacist Management</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Total Pharmacists</h2>
              <p className="text-3xl font-bold mt-2">{statistics.total}</p>
              <p className="text-green-100 text-sm mt-1">Registered in system</p>
            </div>
            <FaUsers className="text-3xl opacity-80" />
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Approved</h2>
              <p className="text-3xl font-bold mt-2">{statistics.approved}</p>
              <p className="text-emerald-100 text-sm mt-1">Active accounts</p>
            </div>
            <FaUserCheck className="text-3xl opacity-80" />
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-xl text-white cursor-pointer hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-1" onClick={() => navigate("/nmra-home/nmra-account-requests")}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Pending Review</h2>
              <p className="text-3xl font-bold mt-2">{statistics.pending}</p>
              <p className="text-yellow-100 text-sm mt-1">Awaiting approval</p>
            </div>
            <FaClock className="text-3xl opacity-80" />
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-yellow-400 border-opacity-30">
            <span className="text-yellow-100 text-sm">Manage requests</span>
            <FaArrowRight className="text-sm" />
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Rejected</h2>
              <p className="text-3xl font-bold mt-2">{statistics.rejected}</p>
              <p className="text-red-100 text-sm mt-1">Applications declined</p>
            </div>
            <FaUserTimes className="text-3xl opacity-80" />
          </div>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Registered Products</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-300 to-blue-400 p-4 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Medicines</p>
              <p className="text-2xl font-bold mt-1">
                {productCounts.medicines.toLocaleString()}
              </p>
            </div>
            <FaPills className="text-2xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-300 to-purple-400 p-4 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Cosmetics</p>
              <p className="text-2xl font-bold mt-1">
                {productCounts.cosmetics.toLocaleString()}
              </p>
            </div>
            <FaFlask className="text-2xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-300 to-amber-400 p-4 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Borderline</p>
              <p className="text-2xl font-bold mt-1">
                {productCounts.borderline.toLocaleString()}
              </p>
            </div>
            <FaBoxes className="text-2xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-300 to-red-400 p-4 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Narcotics</p>
              <p className="text-2xl font-bold mt-1">
                {productCounts.narcotics.toLocaleString()}
              </p>
            </div>
            <FaCapsules className="text-2xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-300 to-emerald-400 p-4 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Precursors</p>
              <p className="text-2xl font-bold mt-1">
                {productCounts.precursors.toLocaleString()}
              </p>
            </div>
            <GiChemicalDrop className="text-2xl opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-300 to-green-400 p-4 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Psychotropics</p>
              <p className="text-2xl font-bold mt-1">
                {productCounts.psychotropics.toLocaleString()}
              </p>
            </div>
            <FaVial className="text-2xl opacity-80" />
          </div>
        </div>
      </div>

      <div className="mt-6 bg-gradient-to-r from-indigo-300 to-indigo-400 p-6 rounded-2xl shadow-lg text-white">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-2xl font-bold">Total Registered Products</h2>
            <p className="text-indigo-100 mt-1">Across all categories in the database</p>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-5xl font-bold">{totalProducts.toLocaleString()}</p>
            <p className="text-indigo-200 mt-1">Products in total</p>
          </div>
        </div>
      </div>
    </div>


    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Pharmacist Status Distribution
        </h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pharmacistStatusData} cx="50%" cy="50%" labelLine={false}  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}               
                outerRadius={80}  innerRadius={40} fill="#8884d8"  dataKey="value">
                {pharmacistStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} pharmacists`, name]}/>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Registered Products Overview
        </h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} fontSize={12} />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} products`, 'Count']} labelStyle={{ color: '#374151', fontWeight: 'bold' }}/>
              <Legend />
              <Bar dataKey="count" name="Number of Products" radius={[4, 4, 0, 0]}>
                {productData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  </div>
);
};

export default NMRADashboard;