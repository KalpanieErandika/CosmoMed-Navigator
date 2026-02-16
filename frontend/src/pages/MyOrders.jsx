import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "./context/Auth1";
import Navbar from "../components/Navbar";
import { FaCheckCircle, FaTimesCircle, FaClock, FaInfoCircle } from "react-icons/fa";
import { MdInfo } from "react-icons/md";

const MyOrders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://127.0.0.1:8000/api/orders/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.status) { //check the backend response
        setOrders(response.data.data);
      } else {
        toast.error(response.data?.message || "Failed to load orders"); //trigger a toast if backend sent status false
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error); //trigger a toast for HTTP errors
      if (error.response?.status === 401) {
        toast.error("Please login to view your orders");
      } else {
        toast.error("Error loading your orders");
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full border border-green-300">
          Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full border border-red-300">
            Rejected
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full border border-yellow-300">
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full border border-gray-300">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
   timeZone: 'Asia/Colombo' 
      })
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "N/A";
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getTotalPrice = (order) => {
    const quantity = order.quantity || 0;
    const unitPrice = order.unit_price || 0;
    return quantity * unitPrice;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 py-2">
        <header className="text-center mb-12 md:mb-1 mt-3">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="relative">
              <span className="text-emerald-800">Order</span>
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-emerald-800/30"></span>
            </span>
            <span className="relative ml-2">
              <span className="text-yellow-500">History</span>
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-yellow-500/30"></span>
            </span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            View and manage all your rare medicine orders
          </p>
        </header>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-yellow-200 mx-20">
          <div className="w-20 h-20 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-yellow-300">
            <MdInfo className="text-3xl text-yellow-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            No Orders Found
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You haven't placed any orders yet. Browse our rare medicines to get started.
          </p>
          <button onClick={() => window.location.href = "/search-rare-medicines"} className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            Browse Medicines
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-yellow-200 overflow-hidden mx-7 md:mx-20 mb-8">

          {/* Table */}
          <div className="overflow-x-auto ">
            <table className="min-w-full bg-white">
              <thead className="bg-green-700 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Medicine Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Order Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Pharmacy
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => ( //for each order object returns tr 
                  <tr key={order.order_id || order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap"> 
                      <div className="font-bold text-gray-900 text-sm">
                        {order.order_id || order.id}
                      </div>
                    </td>
                    
                    {/* Medicine*/}
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-800 text-sm">
                          {order.medicine_name || "N/A"}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {order.dosage_form && (
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">
                              {order.dosage_form}
                            </span>
                          )}
                          {order.strength && (
                            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              {order.strength}mg
                            </span>
                          )}
                        </div>
                        <div className="mt-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">Quantity:</span>
                            <span className="font-semibold">{order.quantity || 0} units</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-gray-600">Unit Price:</span>
                            <span className="font-semibold">{formatCurrency(order.unit_price || 0)}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Order Date*/}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(order.order_date)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDateTime(order.order_date).split(',')[1]}
                      </div>
                    </td>
                    
                    {/* Pharmacy */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {order.pharmacy_name ? (
                          <div className="flex items-start gap-2">
                            <span className="text-sm font-medium text-gray-800">
                              {order.pharmacy_name}
                            </span>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500 italic">
                            Pharmacy info not available
                          </div>
                        )}
                        
                        {order.pharmacy_address && (
                          <div className="flex items-start gap-2">
                            <div className="text-xs text-gray-600 ">
                              {order.pharmacy_address}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    
                    {/* Total Amount */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                        {formatCurrency(getTotalPrice(order))}
                      </div>
                    </td>
                    
                    {/* Status*/}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;