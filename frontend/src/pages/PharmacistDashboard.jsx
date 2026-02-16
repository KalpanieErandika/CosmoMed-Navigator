import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {PieChart, Pie, Cell,BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,ResponsiveContainer, Legend} from "recharts";
import axios from "axios";
import {
  FaClipboardList, FaClock, FaCheckCircle, FaTimesCircle
} from "react-icons/fa";
import { AuthContext } from "./context/Auth1";
import { Spinner } from "react-bootstrap";

const createApi = (token) => {
  const instance = axios.create({
    baseURL: "http://127.0.0.1:8000",
    withCredentials: true,
  });

  instance.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.headers.Accept = "application/json";
    return config;
  });

  instance.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
      }
      return Promise.reject(err);
    }
  );

  return instance;
};

const PharmacistDashboard = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const api = createApi(token);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    revoked:0
  });

  const [dailyOrders, setDailyOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) {
      window.location.href = "/login";
      return;
    }

    if (user.user_type !== "pharmacist") {
      const redirect = {
        nmra_official: "/nmra-home",
        general_user: "/user-home",
      };
      window.location.href = redirect[user.user_type] || "/login";
      return;
    }

    fetchDashboardData();
  }, [user, token]);

  //fetch data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [countsRes, dailyRes] = await Promise.all([
api.get('/api/pharmacist/dashboard/order-counts'),
api.get('/api/pharmacist/dashboard/orders-per-day'),

      ]);

      setStats(countsRes.data);
      setDailyOrders(dailyRes.data);

    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const statusChart = [
    { name: "Pending", value: stats.pending, color: "#f59e0b" },
    { name: "Approved", value: stats.approved, color: "#10b981" },
    { name: "Rejected", value: stats.rejected, color: "#ef4444" },
  ];


  return (
    <div className="space-y-8 p-4 md:p-6">

      <h1 className="text-2xl font-bold text-gray-800">
        Pharmacist Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <StatCard title="Total Orders" value={stats.revoked} icon={<FaClipboardList />}gradient="from-blue-500 to-blue-600"/>

        <StatCard title="Pending Orders" value={stats.revoked} icon={<FaClock />}gradient="from-yellow-500 to-yellow-600"/>

        <StatCard title="Approved Orders" value={stats.revoked} icon={<FaCheckCircle />}gradient="from-green-500 to-green-600"/>

        <StatCard title="Rejected Orders" value={stats.rejected} icon={<FaTimesCircle />}gradient="from-red-500 to-red-600"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">
            Order Status Distribution
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={statusChart} dataKey="value" innerRadius={40} outerRadius={90} label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(1)}%`
                  }>
                  {statusChart.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">
            Orders Per Day
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer>
              <BarChart data={dailyOrders}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, gradient }) => (
  <div className={`p-6 bg-gradient-to-br ${gradient} rounded-2xl shadow-xl text-white`}>
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </div>
      <div className="text-3xl opacity-80">{icon}</div>
    </div>
  </div>
);

export default PharmacistDashboard;
