import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "./context/Auth1";
import { MdOutlineEmail } from "react-icons/md";
import {FaClipboardCheck, FaCheckCircle, FaTimesCircle, FaEye,FaPhone,FaUser,FaMapMarkerAlt,FaBox,FaMoneyBillWave,FaFileMedical,FaSearch} from "react-icons/fa";
import { BiLoaderAlt } from "react-icons/bi";

const OrderRequests = () => {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processingOrder, setProcessingOrder] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");

  const API_BASE = "http://127.0.0.1:8000";

  useEffect(() => {
    if (user?.user_type === 'pharmacist') {
      fetchOrders();
    }
  }, [activeTab, user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      let endpoint = "";
      switch(activeTab) {
        case "pending": 
          endpoint = `${API_BASE}/api/pharmacist/orders/pending`; break;
        case "approved": 
          endpoint = `${API_BASE}/api/pharmacist/orders/approved`; 
          break;
        case "rejected": 
          endpoint = `${API_BASE}/api/pharmacist/orders/rejected`; 
          break;
        default: 
          endpoint = `${API_BASE}/api/pharmacist/orders/pending`;
      }
      
      const response = await axios.get(endpoint, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.status) {
        setOrders(response.data.data);
      } else {
        toast.error(response.data.message || "Failed to fetch orders");
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Error loading orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getOrderDetails = async (orderId) => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/pharmacist/orders/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status) {
        setSelectedOrder(response.data.data);
        setShowDetailsModal(true);}
    } catch (error) {
      toast.error("Error loading order details");
    }
  };

  const approveOrder = async (orderId) => {
    try {
      setProcessingOrder(orderId);
      const response = await axios.post(
        `${API_BASE}/api/pharmacist/orders/${orderId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status) {
        toast.success("Order approved successfully!");     
        //refresh orders after approval
        fetchOrders();
        
        //close modals
        if (showDetailsModal) {
          setShowDetailsModal(false);
          setSelectedOrder(null);
        }
      } else {
        toast.error(response.data.message || "Failed to approve order");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error approving order");
    } finally {
      setProcessingOrder(null);
    }
  };

  const rejectOrder = async (orderId) => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      setProcessingOrder(orderId);
      const response = await axios.post(
        `${API_BASE}/api/pharmacist/orders/${orderId}/reject`,
        { reason: rejectReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status) {
        toast.success("Order rejected successfully!");
        setShowRejectModal(false);
        setRejectReason("");

        fetchOrders();

        if (showDetailsModal) {
          setShowDetailsModal(false);
          setSelectedOrder(null);
        }
      } else {
        toast.error(response.data.message || "Failed to reject order");
      }
    } catch (error) {
      console.error("Error rejecting order:", error);
      toast.error(error.response?.data?.message || "Error rejecting order");
    } finally {
      setProcessingOrder(null);
    }
  };

const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',  
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Colombo'
    });
};

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
             Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
           Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
           Pending
          </span>
        );
    }
  };

  return (
   <div className="min-h-full bg-gradient-to-br from-blue-50 to-green-50 p-6">
  <div className="max-w-full flex flex-col items-center">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center w-full max-w-4xl">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent" >
            Order Management
          </h1>
          <p className="text-gray-600 mt-2 ">
            Review and manage incoming orders for your medicines
          </p>
        </div>

        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button onClick={() => setActiveTab("pending")}className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "pending"
                  ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
              Pending Orders
            </button>

            <button onClick={() => setActiveTab("approved")} className={`py-4 px-5 border-b-2 font-medium text-sm ${activeTab === "approved"
                  ? "border-green-500 text-green-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
              Approved Orders
            </button>

            <button onClick={() => setActiveTab("rejected")} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "rejected"
                  ? "border-red-500 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
              Rejected Orders
            </button>
          </nav>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaClipboardCheck className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Orders Found</h3>
            <p className="text-gray-500">
              {activeTab === "pending" 
                ? "You don't have any pending orders at the moment."  : `No ${activeTab} orders found.`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div key={order.order_id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                {/* Order Header */}
                <div className="px-4 py-3 bg-gradient-to-r from-green-600 to-green-700">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-semibold text-white">
                        Order {order.order_id}
                      </span>
                      <div className="text-xs text-white mt-1">
                        {formatDate(order.order_date)}
                      </div>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>

           <div className="p-4">
                 {/* Customer information*/}
              <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FaUser className="text-gray-500" />
                      <h3 className="font-semibold text-gray-800">Customer</h3>
                    </div>
                    <div className="ml-6">
                      <p className="text-gray-900">{order.customer_name}</p>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <FaPhone className="text-xs" />
                        {order.customer_contact}
                      </div>
                      <MdOutlineEmail />
                      {order.customer_email && (
                        <p className="text-sm text-gray-600">{order.customer_email}</p>
                      )}
                    </div>
                  </div>

                  {/* Medicine Info */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FaBox className="text-gray-500" />
                      <h3 className="font-semibold text-gray-800">Medicine</h3>
                    </div>
                    <div className="ml-6">
                      <p className="text-gray-900 font-medium">{order.medicine_name}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {order.dosage_form}
                        </span>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                          {order.strength}mg
                        </span>
                      </div>
                      <div className="mt-2 flex justify-between text-sm">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-semibold">{order.quantity} units</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-600">Unit Price:</span>
                        <span className="font-semibold">Rs. {parseFloat(order.unit_price || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                        <span>Total:</span>
                        <span className="text-green-600">
                          Rs. {(order.quantity * (order.unit_price || 0)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FaMapMarkerAlt className="text-gray-500" />
                      <h3 className="font-semibold text-gray-800">Delivery Address</h3>
                    </div>
                    <p className="ml-6 text-sm text-gray-600">{order.delivery_address}</p>
                  </div>

                  {/* Prescription Indicator */}
                  {order.prescription_image && (
                    <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FaFileMedical className="text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">Prescription Attached</span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 flex flex-col gap-2">
                    <button onClick={() => getOrderDetails(order.order_id)} className="w-full py-2 px-4 bg-yellow-500 text-gray-700 rounded-lg hover:bg-yellow-600 flex items-center justify-center gap-2">
                     View Details
                    </button>
                    
                    {order.status === 'pending' && (
                      <>
                        <button onClick={() => approveOrder(order.order_id)} disabled={processingOrder === order.order_id}
className="w-full py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" >
                          {processingOrder === order.order_id ? (
                            <>
                             Processing...
                            </>
                          ) : (
                            <>
                              Approve Order
                            </>
                          )}
                        </button>
                        
                        <button onClick={() => { setSelectedOrder(order); setShowRejectModal(true); }}
disabled={processingOrder === order.order_id} className="w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  Reject Order
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
       <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Order {selectedOrder.order_id}</h2>
                  <p className="text-blue-100">{selectedOrder.medicine_name}</p>

                </div>

                <button onClick={() => { setShowDetailsModal(false); setSelectedOrder(null); }} className="text-white hover:text-blue-200 text-2xl" >
                  &times;
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Quick Actions */}
              {selectedOrder.status === 'pending' && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-bold text-yellow-800 mb-2">Review Required</h3>
                  <div className="flex gap-3">

                    <button onClick={() => approveOrder(selectedOrder.order_id)} disabled={processingOrder === selectedOrder.order_id} className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {processingOrder === selectedOrder.order_id ? (
                        <>
                           Processing...
                        </>
                      ) : (
                        <>
                          Approve Order
                        </>
                      )}
                    </button>
                    <button onClick={() => { setShowDetailsModal(false); setShowRejectModal(true); }} disabled={processingOrder === selectedOrder.order_id}
 className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" >
                       Reject Order
                    </button>
                  </div>
                </div>
              )}

              {/* Prescription Preview */}
              {selectedOrder.prescription_image && (
                <div className="mb-6">
                  <h3 className="font-bold text-gray-800 mb-3 text-lg">Prescription</h3>
                  <div className="border rounded-lg p-4 bg-gray-50">

                    <img src={`${API_BASE}/storage/${selectedOrder.prescription_image}`} alt="Prescription" className="max-w-full h-auto max-h-96 mx-auto rounded" onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/400x300?text=Prescription+Not+Found";
                      }}/>
              </div>
                </div>
              )}

              {/* Order Details*/}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-800 mb-3 text-lg">Customer Details</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-600">Full Name</div>
                      <div className="font-medium">{selectedOrder.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Contact Number</div>
                      <div className="font-medium">{selectedOrder.contact_no}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Email</div>
                      <div className="font-medium">{selectedOrder.customer_email || "Not provided"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Delivery Address</div>
                      <div className="font-medium">{selectedOrder.address}</div>
                    </div>
                  </div>
                </div>

                {/* Order summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-800 mb-3 text-lg">Order Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Medicine:</span>
                      <span className="font-medium">{selectedOrder.medicine_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dosage Form:</span>
                      <span className="font-medium">{selectedOrder.dosage_form}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Strength:</span>
                      <span className="font-medium">{selectedOrder.strength}mg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-medium">{selectedOrder.quantity} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Unit Price:</span>
                      <span className="font-medium">Rs. {parseFloat(selectedOrder.unit_price || 0).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-bold">
                        <span>Total Amount:</span>
                        <span className="text-green-600">
                          Rs. {(selectedOrder.quantity * (selectedOrder.unit_price || 0)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-xl flex justify-end gap-4">
              <button
                onClick={() => { setShowDetailsModal(false); setSelectedOrder(null); }} className="px-6 py-2 bg-yellow-600 text-black rounded-lg hover:bg-yellow-700" >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject order modal*/}
{showRejectModal && selectedOrder && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-gray-200">
      
      {/* Header */}
      <div className="bg-red-50 border-b border-red-100 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Reject Order</h2>
              <p className="text-sm text-gray-600 mt-1">Order #{selectedOrder.order_id}</p>
            </div>
          </div>
          <button
            onClick={() => { setShowRejectModal(false); setRejectReason(""); }} className="text-gray-500 hover:text-gray-700 text-xl" >
            &times;
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-1">
          <div className="flex items-center gap-2 mb-3">
            <FaBox className="text-gray-500" />
            <span className="font-medium text-gray-800">{selectedOrder.medicine_name}</span>
          </div>
          <div className="text-sm text-gray-600 mb-6">
            Please provide a reason for rejecting this order from <span className="font-medium">{selectedOrder.customer_name}</span>.
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason *
            </label>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="e.g., Invalid prescription, Out of stock, Incomplete information..." className="w-full p-3 border border-gray-300 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500" rows="3" required />
            <p className="text-xs text-gray-500 mt-2">
              This reason will be shared with the customer.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-xl flex justify-end gap-3">
        <button onClick={() => { setShowRejectModal(false); setRejectReason(""); }} className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium" >
          Cancel
        </button>

        <button onClick={() => rejectOrder(selectedOrder.order_id)} disabled={!rejectReason.trim() || processingOrder === selectedOrder.order_id} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" >
          {processingOrder === selectedOrder.order_id ? (
            <>
              Processing...
            </>
          ) : (
            <>
              Reject Order
            </>
          )}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
    </div>
  );
};

export default OrderRequests;
