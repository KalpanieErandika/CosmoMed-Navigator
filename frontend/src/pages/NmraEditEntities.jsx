import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEdit, FaSave, FaTimes, FaSpinner, FaSearch, FaTrash, FaEye, FaClinicMedical, FaTruck, FaIndustry, FaSync} from "react-icons/fa";

export default function NMRAEditEntities() {
  const [activeTab, setActiveTab] = useState("pharmacies");
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isLoadingEntities, setIsLoadingEntities] = useState(false);
  const [viewingEntity, setViewingEntity] = useState(null);

  // Entity fields mapping with ID column names
  const entityConfig = {
    pharmacies: {
      fields: [
        { display: "File No", column: "file_no" },
        { display: "Pharmacy Name", column: "pharmacy_name" },
        { display: "Address", column: "address" },
        { display: "Pharmacist Name", column: "pharmacist_name" },
        { display: "SLMC Registration No", column: "slmc_reg_no" },
        { display: "MOH", column: "moh" },
        { display: "District", column: "district" },
      ],
      idColumn: "id",
      tableName: "pharmacies",
      searchFields: ["file_no", "pharmacy_name", "pharmacist_name", "district", "moh"]
    },
    importers: {
      fields: [
        { display: "Name", column: "Name" },
        { display: "Address", column: "Address" },
      ],
      idColumn: "importer_id",
      tableName: "importers",
      searchFields: ["Name", "Address"]
    },
    exporters: {
      fields: [
        { display: "Name", column: "Name" },
        { display: "Address", column: "Address" },
      ],
      idColumn: "exporter_id",
      tableName: "exporters",
      searchFields: ["Name", "Address"]
    },
    manufacturers: {
      fields: [
        { display: "Name", column: "Name" },
        { display: "Site Address", column: "SiteAddress" },
        { display: "Registered Office", column: "RegisteredOffice" },
        { display: "Product Range", column: "ProductRange" },
        { display: "Category", column: "Category" },
      ],
      idColumn: "Id",
      tableName: "manufacturers",
      searchFields: ["Name", "Category", "ProductRange"]
    },
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

  // Define ID columns for each table
  const idColumns = {
    pharmacies: "id",
    importers: "importer_id",
    exporters: "exporter_id",
    manufacturers: "Id",
  };

  useEffect(() => {
    fetchEntities();
  }, [activeTab]);

  const fetchEntities = async () => {
    setIsLoadingEntities(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://127.0.0.1:8000/api/entities/${entityConfig[activeTab].tableName}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        }
      );

      if (response.data.status) {
        setEntities(response.data.data);
      } else {
        toast.error(response.data.message || "Failed to fetch entities");
        setEntities([]);
      }
    } catch (err) {
      toast.error("Error fetching entities. Please try again.");
      setEntities([]);
    } finally {
      setIsLoadingEntities(false);
    }
  };

  const handleEdit = (entity) => {
    setEditingId(entity[idColumns[activeTab]]);
    setEditFormData({ ...entity });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const idColumn = idColumns[activeTab];
      const tableName = entityConfig[activeTab].tableName;
      
      // Prepare update data 
      const updateData = { ...editFormData };
      delete updateData[idColumn];
      delete updateData.created_at;
      delete updateData.updated_at;

      const response = await axios.put(
        `http://127.0.0.1:8000/api/entities/${tableName}/${editingId}`,
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
        toast.success(`${entityTypeNames[activeTab]} updated successfully!`);
        setEditingId(null);
        setEditFormData({});
        fetchEntities(); // Refresh the list
      } else {
        toast.error(response.data.message || "Failed to update entity");
      }
    } catch (err) {
      console.error('Error updating entity:', err);
      if (err.response?.data?.message) {
        toast.error(`${err.response.data.message}`);
      } else {
        toast.error("Error updating entity. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete this ${entityTypeNames[activeTab].toLowerCase()}? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const tableName = entityConfig[activeTab].tableName;
      
      const response = await axios.delete(
        `http://127.0.0.1:8000/api/entities/${tableName}/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        }
      );

      if (response.data.status) {
        toast.success(`${entityTypeNames[activeTab]} deleted successfully!`);
        fetchEntities(); // Refresh the list
      } else {
        toast.error(response.data.message || "Failed to delete entity");
      }
    } catch (err) {
      toast.error("Error deleting entity. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (columnName, value) => {
    setEditFormData(prev => ({
      ...prev,
      [columnName]: value
    }));
  };

  const handleView = (entity) => {
    setViewingEntity(entity);
  };

  const closeViewModal = () => {
    setViewingEntity(null);
  };

  // Filter entities based on search term
  const filteredEntities = entities.filter(entity => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    const searchFields = entityConfig[activeTab].searchFields;
    
    return searchFields.some(field => {
      const value = entity[field];
      return value && value.toString().toLowerCase().includes(searchLower);
    });
  });

  // Get current entity fields
  const getCurrentFields = () => entityConfig[activeTab].fields;

  // Get display fields (first 3 for table view)
  const getDisplayFields = () => {
    const fields = getCurrentFields();
    if (activeTab === "pharmacies") {
      return fields.slice(0, 3); // File No, Pharmacy Name, Address
    }
    return fields.slice(0, 2); // Name, Address for others
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 py-4 px-4">
      <div className="max-w-6xl mx-auto">
 
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-green-700 to-yellow-500 bg-clip-text text-transparent">
            Edit Entities
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Update,  or delete registered pharmacies, importers, exporters, and manufacturers
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-green-100">

          <div className="bg-gradient-to-r from-green-800 to-green-600 p-4">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <FaEdit className="text-xl text-yellow-300" />
              Select Entity Type
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">

              {Object.keys(entityTypeIcons).map((type) => (
                <button key={type} onClick={() => setActiveTab(type)} className={`p-2 rounded-lg border transition-all duration-200 hover:scale-102 ${
                    activeTab === type
                      ? "border-yellow-400 bg-yellow-400 bg-opacity-20 text-white shadow-md"
                      : "border-green-400 border-opacity-30 text-white hover:bg-green-700 hover:bg-opacity-50"}`}>
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

          <div className="p-4 border-b border-green-100">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder={`Search ${entityTypeNames[activeTab].toLowerCase()}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                      }}}className="w-full pl-10 pr-4 py-2 border border-green-100 rounded-lg focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200"/>
                </div>

                <button onClick={() => {
                    if (searchTerm.trim() === '') {
                      fetchEntities();}
                  }} className="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-all duration-200 flex items-center justify-center gap-2 text-sm whitespace-nowrap">
             
                  Search
                </button>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                {entityTypeNames[activeTab]} 
              </h2>

            </div>

            {filteredEntities.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-200">
                  <FaSearch className="text-2xl text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-2">
                  No {entityTypeNames[activeTab]} Found
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  {searchTerm ? `No ${entityTypeNames[activeTab].toLowerCase()} match your search` : `No ${entityTypeNames[activeTab].toLowerCase()} in this category`}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-green-50 border-b border-green-100">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        ID
                      </th>
                      {getDisplayFields().map(field => (
                        <th key={field.column} className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          {field.display}
                        </th>
                      ))}
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntities.map(entity => {
                      const idColumn = idColumns[activeTab];
                      const isEditing = editingId === entity[idColumn];
                      
                      return isEditing ? (
                        <tr key={entity[idColumn]} className="bg-yellow-50 border-b border-yellow-100">
                          <td colSpan={getDisplayFields().length + 2} className="p-4">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-bold text-gray-800">Editing {entityTypeNames[activeTab]} ID: {entity[idColumn]}</h4>
                                <div className="flex gap-2">

                       <button onClick={handleSaveEdit} disabled={loading} className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-1 disabled:opacity-50 min-w-[80px]">
                                    {loading ? (
                                      <>
                                                Saving...
                                      </>
                                    ) : (
                                      "Save"
                                    )}
                                  </button>
                                  <button onClick={handleCancelEdit} className="px-3 py-1 bg-yellow-400 text-white rounded-lg text-sm hover:bg-yellow-500 transition-all duration-200 flex items-center gap-1" >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {getCurrentFields().map(field => (
                                  <div key={field.column} className="group">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                      {field.display}
                                    </label>
                                    {field.column.toLowerCase().includes("address") ? (
                      <textarea className="w-full px-3 py-2 text-sm border border-yellow-300 rounded-lg focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200 resize-none" value={editFormData[field.column] || ""} onChange={(e) => handleInputChange(field.column, e.target.value)}
                                        placeholder={field.display} rows="2" />
                                    ) : (
                                      <input type="text" className="w-full px-3 py-2 text-sm border border-yellow-300 rounded-lg focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200" value={editFormData[field.column] || ""}
                                        onChange={(e) => handleInputChange(field.column, e.target.value)} placeholder={field.display}/>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr key={entity[idColumn]} className="border-b border-green-50 hover:bg-green-50 transition-colors duration-150">
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">
                            {entity[idColumn]}
                          </td>
                          {getDisplayFields().map(field => (
                            <td key={field.column} className="py-3 px-4 text-sm text-gray-700">
                              {entity[field.column] || "-"}
                            </td>
                          ))}
                          <td className="py-3 px-4 text-sm">
                            <div className="flex items-center gap-2">

                              <button onClick={() => handleEdit(entity)} className="p-1.5 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-all duration-200"title="Edit">
                                <FaEdit className="text-xs" />
                              </button>
                              <button onClick={() => handleDelete(entity[idColumn])} className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200"title="Delete">
                                <FaTrash className="text-xs" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>


      {viewingEntity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
         
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
     
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-end gap-3">
                  <button onClick={() => { handleEdit(viewingEntity); closeViewModal(); }}
                    className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-800 font-semibold rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 flex items-center gap-2">
                    <FaEdit />
                    Edit {entityTypeNames[activeTab]}
                  </button>
              
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}