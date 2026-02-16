import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ViewComplaint() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState({ id: null, status: "" });
  const [searching, setSearching] = useState(false); 

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        toast.error("Please login first");
        setLoading(false);
        return;
      }

      const res = await fetch("http://localhost:8000/api/complaints", {
        headers: { 
          "Accept": "application/json",
          "Authorization": `Bearer ${token}` 
        },
      });
      
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      
      const data = await res.json();
      setComplaints(data);
      
    } catch (error) {
      console.error("Error fetching complaints:", error);
      toast.error(`Error loading complaints: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories from complaints
  const categories = ["All", ...new Set(complaints.map(c => c.category).filter(Boolean))];

  const viewAttachment = (complaint) => {
    let fileUrl = complaint.full_image_url;
    
    if (!fileUrl && complaint.image_url) {
      fileUrl = complaint.image_url.startsWith('http') 
        ? complaint.image_url 
        : `http://localhost:8000/storage/${complaint.image_url}`;
    }
    
    window.open(fileUrl, "_blank");
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/api/complaints/${id}/status`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ status }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setComplaints(prev => prev.map(c => c.complaint_id === id ? { ...c, status } : c));
        toast.success(`Status updated to ${status}`);
      } else {
        toast.error(result.message || "Failed to update status");
        fetchComplaints();
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
      fetchComplaints();
    }
  };

  const handleStatusUpdate = (id, status) => {
    setSelectedComplaint({ id, status });
    setShowConfirmModal(true);
  };

  const handleConfirmUpdate = () => {
    if (selectedComplaint.id && selectedComplaint.status) {
      updateStatus(selectedComplaint.id, selectedComplaint.status);
      setShowConfirmModal(false);
      setSelectedComplaint({ id: null, status: "" });
    }
  };

  const handleCancelUpdate = () => {
    setShowConfirmModal(false);
    setSelectedComplaint({ id: null, status: "" });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Resolved": return "bg-green-100 text-green-800";
      case "Rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusOptions = (currentStatus) => {
    if (currentStatus === "Resolved" || currentStatus === "Rejected") return [];
    const allOptions = ["Resolved", "Rejected"];
    return allOptions.filter(option => option !== currentStatus);
  };

  const getFileType = (imageUrl) => {
    if (!imageUrl) return null;
    const extension = imageUrl.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png'].includes(extension)) return 'image';
    if (extension === 'pdf') return 'pdf';
    return 'file';
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesStatus = selectedStatus === "All" || complaint.status === selectedStatus;
    const matchesCategory = selectedCategory === "All" || complaint.category === selectedCategory;
    return matchesStatus && matchesCategory;
  });

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Colombo' 
      }).replace(',', '');
    } catch (error) {
      return "Invalid date";
    }
  };

  const handleClearFilters = () => {
    if (selectedStatus !== "All" || selectedCategory !== "All") {
      setSelectedStatus("All");
      setSelectedCategory("All");
      toast.info("Filters cleared");
    } else {
      toast.info("No filters to clear");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-full">
    
        <div className="mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Complaint Management
          </h1>
          <p className="text-gray-600">Manage customer complaints</p>
        </div>

        {/* Results Table */}
        {filteredComplaints.length > 0 ? (
          <div className="bg-white rounded-lg shadow border border-yellow-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-green-700 text-white">
                  <tr>
                    <th className="px-3 py-3 text-left font-bold w-12">No</th>
                    <th className="px-3 py-3 text-left font-bold w-32">Email</th>
                    <th className="px-3 py-3 text-left font-bold w-24">Category</th>
                    <th className="px-3 py-3 text-left font-bold w-40">Description</th>
                    <th className="px-3 py-3 text-left font-bold w-24">Attachment</th>
                    <th className="px-3 py-3 text-left font-bold w-24">Status</th>
                    <th className="px-3 py-3 text-left font-bold w-32">Actions</th>
                    <th className="px-3 py-3 text-left font-bold w-32">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((c, index) => (
                    <tr key={c.complaint_id} className="border-b border-gray-100 hover:bg-gray-50">
        
                      <td className="px-3 py-2 font-medium">{index + 1}</td>
                      
                      <td className="px-3 py-2">
                        <a href={`mailto:${c.email}`} className="text-blue-600 hover:text-blue-800 hover:underline text-xs truncate block" title={c.email} >
                          {c.email.length > 20 ? c.email.substring(0, 20) + '...' : c.email}
                        </a>
                      </td>
                      
                      <td className="px-3 py-2">
                        <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded-full truncate block">
                          {c.category}
                        </span>
                      </td>
                      
                      <td className="px-3 py-2">
                        <div className="text-gray-900 truncate max-w-[160px] text-xs" title={c.description}>
                          {c.description.length > 30 ? c.description.substring(0, 30) + '...' : c.description}
                        </div>
                      </td>

                      <td className="px-3 py-2">
                        {c.image_url ? (
                          <button onClick={() => viewAttachment(c)} className="flex items-center justify-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100 transition-colors" title="View attachment" >
                            {getFileType(c.image_url) === 'pdf' ? 'PDF' : 'View'}
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs italic">None</span>
                        )}
                      </td>
                      
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(c.status)}`}>
                          {c.status}
                        </span>
                      </td>
                      
                      <td className="px-3 py-2">
                        {getStatusOptions(c.status).length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {getStatusOptions(c.status).map((status) => (
                              <button key={status} onClick={() => handleStatusUpdate(c.complaint_id, status)}   
                                className={`px-2 py-0.5 text-xs rounded transition-colors ${status === "Resolved" 
                                  ? "bg-green-50 text-green-700 hover:bg-green-100" 
                                  : "bg-red-50 text-red-700 hover:bg-red-100"
                                }`}>
                                {status}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">—</span>
                        )}
                      </td>
                      
                      <td className="px-3 py-2 text-gray-500 text-xs">
                        {formatDate(c.submitted_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="bg-white rounded-lg shadow border border-yellow-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {selectedStatus !== "All" || selectedCategory !== "All" ? "No Complaints Found" : "No Complaints"}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {selectedStatus !== "All" || selectedCategory !== "All"
                  ? `No matches found with current filters`
                  : "No complaints in the system yet"}
              </p>

              {(selectedStatus !== "All" || selectedCategory !== "All") && (
                <button onClick={handleClearFilters} className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2 px-4 rounded-lg shadow hover:shadow-md">
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleCancelUpdate} />
            <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-blue-100 rounded-full">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Confirm Status Change
                </h3>
                <p className="text-gray-600">
                  Are you sure you want to change the status to{" "}
                  <span className="font-semibold text-green-600">"{selectedComplaint.status}"</span>?
                </p>
              </div>
              
              <div className="flex gap-3 justify-center">
                <button onClick={handleConfirmUpdate} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl" >
                  Yes, Update
                </button>

                <button onClick={handleCancelUpdate} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-gray-800 font-medium py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-xl">
                  Cancel
                </button>
              </div>
              
              <p className="text-xs text-gray-500 text-center mt-4">
                This action will update the complaint status
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewComplaint;