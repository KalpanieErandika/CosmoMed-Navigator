import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaPlus, FaSync, FaBuilding, FaSpinner,FaClinicMedical,FaTruck,FaIndustry,FaShieldAlt} from "react-icons/fa";

export default function NMRAAddEntities() {
  const [entityType, setEntityType] = useState("");
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("");

  // Entity fields mapping
  const entityFields = {
    pharmacies: [
      { display: "File No", column: "file_no" },
      { display: "Pharmacy Name", column: "pharmacy_name" },
      { display: "Address", column: "address" },
      { display: "Pharmacist Name", column: "pharmacist_name" },
      { display: "SLMC Registration No", column: "slmc_reg_no" },
      { display: "MOH", column: "moh" },
      { display: "District", column: "district" },
    ],
    importers: [
      { display: "Name", column: "Name" },
      { display: "Address", column: "Address" },
    ],
    exporters: [
      { display: "Name", column: "Name" },
      { display: "Address", column: "Address" },
    ],
    manufacturers: [
      { display: "Name", column: "Name" },
      { display: "Site Address", column: "SiteAddress" },
      { display: "Registered Office", column: "RegisteredOffice" },
      { display: "Product Range", column: "ProductRange" },
      { display: "Category", column: "Category" },
    ],
  };

  const entityTypeIcons = {
    pharmacies: <FaClinicMedical className="text-yellow-400" />,
    importers: <FaTruck className="text-yellow-400" />,
    exporters: <FaTruck className="text-yellow-400" />,
    manufacturers: <FaIndustry className="text-yellow-400" />,
  };

  const entityTypeNames = {
    pharmacies: "Pharmacies",
    importers: "Importers",
    exporters: "Exporters",
    manufacturers: "Manufacturers",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!entityType) {
      toast.error("Please select an entity type");
      setLoading(false);
      return;
    }

    // Validate required fields
    const requiredFields = entityFields[entityType];
    const missingFields = requiredFields.filter(field => !formData[field.column]?.trim());
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields`);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Prepare data with exact column names
      const submitData = {};
      entityFields[entityType].forEach(field => {
        submitData[field.column] = formData[field.column] || "";
      });

      const response = await axios.post(
        "http://127.0.0.1:8000/api/entities/add",
        {
          entity_type: entityType,
          data: submitData,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        }
      );

      console.log("Response:", response.data);

      if (response.data.status) {
        toast.success("Entity added successfully!");
        setFormData({});
        setEntityType("");
        setActiveTab("");
      } else {
        toast.error(response.data.message || "Failed to add entity");
      }
    } catch (err) {
      console.error('Error adding entity:', err);
      console.error('Error response:', err.response);
      
      if (err.response?.status === 401) {
        toast.error("Authentication failed. Please log in again.");
      } else if (err.response?.data?.message) {
        toast.error(`${err.response.data.message}`);
      } else if (err.response?.data?.errors) {
        const errors = Object.values(err.response.data.errors).flat();
        toast.error(`${errors.join(', ')}`);
      } else {
        toast.error("Error adding entity. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (columnName, value) => {
    setFormData(prev => ({
      ...prev,
      [columnName]: value
    }));
  };

  const resetForm = () => {
    setEntityType("");
    setFormData({});
    setActiveTab("");
  };

  const handleEntityTypeSelect = (type) => {
    setEntityType(type);
    setActiveTab(type);
    setFormData({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 py-4 px-4">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-green-700 to-yellow-500 bg-clip-text text-transparent">
            Add New Entity
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Register new pharmacies, importers, exporters, and manufacturers in the NMRA database
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-green-100">

          <div className="bg-gradient-to-r from-green-800 to-green-600 p-4">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <FaBuilding className="text-xl text-yellow-300" />
              Select Entity Type
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.keys(entityTypeIcons).map((type) => (
                <button key={type} onClick={() => handleEntityTypeSelect(type)} className={`p-3 rounded-lg border transition-all duration-200 hover:scale-102 ${
                    activeTab === type
                      ? "border-yellow-400 bg-yellow-400 bg-opacity-20 text-white shadow-md"
                      : "border-green-400 border-opacity-30 text-white hover:bg-green-700 hover:bg-opacity-50"
                  }`}>

                  <div className="flex flex-col items-center gap-1">
                    <div className="text-lg">
                      {entityTypeIcons[type]}
                    </div>
                    <span className="text-xs font-medium text-center leading-tight">
                      {entityTypeNames[type]}
                    </span>
          
                  </div>
                </button>
              ))}
            </div>
          </div>


   {entityType && (
            <div className="p-4">

              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-green-100">
       
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-800">
                    Add {entityTypeNames[entityType]}
                  </h2>
                  <p className="text-xs text-gray-600">
                    Fill in all required details
                  </p>
                </div>
     
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {entityFields[entityType].map((field) => (
                    <div key={field.column} className="group">
                      <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                        {field.display}
                        <span className="text-red-500 text-xs">*</span>
                      </label>
                      {field.column === "address" || field.display.includes("Address") ? (
                        <textarea className="w-full px-3 py-2 text-sm border border-green-100 rounded-lg focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 group-hover:border-yellow-300 placeholder-gray-400 bg-white resize-none" value={formData[field.column] || ""}
onChange={(e) => handleInputChange(field.column, e.target.value)} placeholder={`Enter ${field.display.toLowerCase()}`} rows="2"/>

                      ) : (
                        <input type="text" className="w-full px-3 py-2 text-sm border border-green-100 rounded-lg focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 group-hover:border-yellow-300 placeholder-gray-400 bg-white"
      value={formData[field.column] || ""} onChange={(e) => handleInputChange(field.column, e.target.value)} placeholder={`Enter ${field.display.toLowerCase()}`} />
                      )}
                    </div>
                  ))}
                </div>

<div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-green-100">
                  <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
                    {loading ? (
                      <>
                        Adding...
                      </>
                    ) : (
                      <>
                        Add Entity
                      </>
                    )}
                  </button>
                  <button type="button" onClick={resetForm} className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-md flex items-center justify-center gap-2 text-sm">
                    Reset
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Empty State */}
          {!entityType && (
            <div className="p-6 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-200">
                  <FaBuilding className="text-2xl text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">
                  Select Entity Type
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Choose a category above to start registering entities
                </p>
    
              </div>
            </div>
          )}
        </div>
    
      </div>
    </div>
  );
}