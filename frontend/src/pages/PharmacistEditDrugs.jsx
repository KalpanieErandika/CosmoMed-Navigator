import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {FaSearch, FaEdit, FaTrash, FaEye, FaSave, FaTimes,FaFilter,FaSpinner,FaPills,FaCapsules,FaWeight,FaMoneyBillWave,FaDatabase,FaList} from "react-icons/fa";

export default function PharmacistEditDrugs() {
  const [rareMedicines, setRareMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [viewingId, setViewingId] = useState(null);
  const [dosageForms] = useState([
    "Tablet", "Capsule", "Syrup", "Injection", "Ointment", 
    "Cream", "Drop", "Inhaler", "Powder", "Suspension"
  ]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch rare medicines
  const fetchRareMedicines = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error("Please login first");
        window.location.href = "/login";
        return;
      }

      const apiUrl = "http://127.0.0.1:8000/api/pharmacist/rare-medicines";

      const response = await axios.get(
        apiUrl,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        }
      );

      if (response.data.status) {
        setRareMedicines(response.data.data);
        setFilteredMedicines(response.data.data);
      } else {
        toast.error(response.data.message || "Failed to fetch rare medicines");
      }
    } catch (err) {
      console.error('Error fetching rare medicines:', err);
      toast.error("Error fetching rare medicines. Please try again.");
    }
  };

  useEffect(() => {
    fetchRareMedicines();
  }, []);

  const handleSearch = async () => {
  if (!searchTerm.trim()) {
    setFilteredMedicines(rareMedicines);
    setIsSearching(false);
    return;
  }

  try {
    setIsSearching(true);
    const token = localStorage.getItem("token");

    const response = await axios.get(
      "http://127.0.0.1:8000/api/pharmacist/rare-medicines/search",
      {
        params: { search: searchTerm },
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    if (response.data.status) {
      setFilteredMedicines(response.data.data);
    } else {
      toast.error("Search failed");
    }
  } catch (error) {
    console.error("Search error:", error);
    toast.error("Error searching rare medicines");
  }
};

  // Handle Enter key press for search
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm("");
    setFilteredMedicines(rareMedicines);
    setIsSearching(false);
  };

  // Edit handlers
  const handleEdit = (medicine) => {
    setEditingId(medicine.rare_id);
    setEditFormData({ ...medicine });
    setViewingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  // Update handler
  const handleEditChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEdit = async () => {
    if (!editingId) {
      toast.error("No medicine selected for editing");
      return;
    }

    // Validate required fields
    const requiredFields = ["medicine_name", "quantity", "dosage_form", "strength", "unit_price"];
    const missingFields = requiredFields.filter(field => !editFormData[field]?.toString().trim());
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields`);
      return;
    }

    // Validate numeric fields
    if (isNaN(editFormData.quantity) || parseInt(editFormData.quantity) <= 0) {
      toast.error("Quantity must be a positive number");
      return;
    }

    if (isNaN(editFormData.strength) || parseInt(editFormData.strength) <= 0) {
      toast.error("Strength must be a positive number");
      return;
    }

    if (isNaN(editFormData.unit_price) || parseFloat(editFormData.unit_price) <= 0) {
      toast.error("Unit price must be a positive number");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const updateData = {
        medicine_name: editFormData.medicine_name.trim(),
        quantity: parseInt(editFormData.quantity),
        dosage_form: editFormData.dosage_form,
        strength: parseInt(editFormData.strength),
        unit_price: parseFloat(editFormData.unit_price)
      };

      const response = await axios.put(
        `http://127.0.0.1:8000/api/pharmacist/rare-medicines/${editingId}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        }
      );

      if (response.data.status) {
        toast.success("Rare medicine updated successfully!");
        setEditingId(null);
        setEditFormData({});
        fetchRareMedicines();
      } else {
        toast.error(response.data.message || "Failed to update medicine");
      }
    } catch (err) {
      console.error('Error updating rare medicine:', err);
      toast.error("Error updating rare medicine. Please try again.");
    }
  };

  const handleDelete = async (medicineId) => {
    if (!medicineId) {
      toast.error("Invalid medicine ID");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this rare medicine? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(
        `http://127.0.0.1:8000/api/pharmacist/rare-medicines/${medicineId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        }
      );

      if (response.data.status) {
        toast.success("Rare medicine deleted successfully!");
        fetchRareMedicines();
      } else {
        toast.error(response.data.message || "Failed to delete medicine");
      }
    } catch (err) {
      console.error('Error deleting rare medicine:', err);
      toast.error("Error deleting rare medicine. Please try again.");
    }
  };

  const handleView = (medicine) => {
    setViewingId(viewingId === medicine.rare_id ? null : medicine.rare_id);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Manage Rare Medicines
          </h1>
          <p className="text-gray-600 text-lg">
            Edit or delete rare medicines you have added to the database
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Search Bar */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
    
                Search Rare Medicines
              </label>
              <div className="relative">
                <input  type="text" placeholder="Search by medicine name"  value={searchTerm} 
  onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={handleKeyPress} className="w-full px-4 py-3 border-2 border-yellow-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all placeholder-gray-400 hover:border-yellow-500 pr-36"/>
                <div className="absolute right-0 top-0 bottom-0 flex items-center">
                  <button onClick={handleSearch} className="h-full px-6 bg-yellow-500 text-white rounded-r-lg hover:bg-yellow-600 transition-all flex items-center ml-30">
                    <span className="hidden sm:inline">Search</span>
                  </button>
                </div>
              </div>
            </div>
 
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">

          <div className="px-6 py-4 bg-gradient-to-r from-green-800 to-green-600 text-white">
            <div className="flex justify-between items-center">
              <div>
       <h2 className="text-xl font-bold"> Search Results </h2>
              </div>
            </div>
          </div>

          {/* Medicines Table */}
          <div>
            {filteredMedicines.length === 0 ? (
              <div className="p-8 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-200">
                    <FaPills className="text-2xl text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-700 mb-2">
                    {isSearching ? "No medicines found" : "No rare medicines yet"}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {isSearching ? (
                      `No rare medicines found for "${searchTerm}"`
                    ) : (
                      "You haven't added any rare medicines yet. Add your first rare medicine!"
                    )} </p>

                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        No
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Medicine Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Dosage Form
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Quantity
                      </th>

               
               <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredMedicines.map((medicine, index) => {
                      const isEditing = editingId === medicine.rare_id;
                      const isViewing = viewingId === medicine.rare_id;
                      
                      return (
                        <React.Fragment key={medicine.rare_id}>
                          {/* Main Row */}
                          <tr className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {index + 1}
                            </td>
                            <td className="px-4 py-3">
                              {isEditing ? (
                                <input type="text" value={editFormData.medicine_name || ""} onChange={(e) => handleEditChange("medicine_name", e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded text-sm"/>
                              ) : (
                                <span className="text-sm font-medium text-gray-800">
                                  {medicine.medicine_name}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {isEditing ? (
                                <select value={editFormData.dosage_form || ""} onChange={(e) => handleEditChange("dosage_form", e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded text-sm">
                                  <option value="">Select form</option>
                                  {dosageForms.map((form) => (
                                    <option key={form} value={form}>{form}</option>
                                  ))}
                                </select>
                              ) : (
                                <span className="text-sm text-gray-700">
                                  {medicine.dosage_form}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {isEditing ? (
                                <input type="number" min="1"value={editFormData.quantity || ""}  onChange={(e) => handleEditChange("quantity", e.target.value)} className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"/>
                              ) : (
                                <span className="text-sm text-gray-700">
                                  {medicine.quantity} units
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {isEditing ? (
                                <input type="number" min="0.01" step="0.01" value={editFormData.unit_price || ""}
onChange={(e) => handleEditChange("unit_price", e.target.value)} className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"/>
                              ) : (
                                <span className="text-sm font-semibold text-green-600">
                                  Rs. {parseFloat(medicine.unit_price).toFixed(2)}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {isEditing ? (
                                  <>
                                    <button onClick={handleSaveEdit} className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm" >
                                       Save
                                    </button>
                                    <button onClick={handleCancelEdit} className="flex items-center gap-1 px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm">
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => handleEdit(medicine)} className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm">
                                     Edit
                                    </button>
                                  
                                    <button onClick={() => handleDelete(medicine.rare_id)} className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                                      Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                      
                 {/* Edit*/}
                          {isEditing && (
                            <tr>
                              <td colSpan={6} className="px-4 py-4 bg-blue-50">
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
                                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    Edit Medicine Details
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Medicine Name *
                                      </label>
                                      <input type="text" value={editFormData.medicine_name || ""}  onChange={(e) => handleEditChange("medicine_name", e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"required/>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Dosage Form *
                                      </label>

                             <select value={editFormData.dosage_form || ""} onChange={(e) => handleEditChange("dosage_form", e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500" required >
                                   <option value="">Select form</option>
                                        {dosageForms.map((form) => (
                                          <option key={form} value={form}>{form}</option>
                                        ))}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Strength (mg) *
                                      </label>
                                      <input type="number" min="1" value={editFormData.strength || ""} onChange={(e) => handleEditChange("strength", e.target.value)}className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500" required/>
                                    </div>

                                    <div>
                                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Quantity *
                                      </label>

                                      <input type="number" min="1" value={editFormData.quantity || ""} onChange={(e) => handleEditChange("quantity", e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500" required />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                                        Unit Price (LKR) *
                                      </label>
                                      <input type="number" min="0.01" step="0.01"  value={editFormData.unit_price || ""} onChange={(e) => handleEditChange("unit_price", e.target.value)}
      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500" required />
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}