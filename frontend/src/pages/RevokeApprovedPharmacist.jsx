import React, { useState, useEffect, useContext } from "react";
import { Card, Button, Badge, Modal, Form, Spinner, Container, Row, Col } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from './context/Auth1';

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
    (error) => Promise.reject(error)
  );

  return instance;
};

const RevokeApprovedPharmacist = () => {
  const { user, token: authToken } = useContext(AuthContext);
  const [approvedPharmacists, setApprovedPharmacists] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false); 
  const [showModal, setShowModal] = useState(false);
  const [selectedPharmacist, setSelectedPharmacist] = useState(null);
  const [revocationReason, setRevocationReason] = useState("");
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false); //to track if a search has been performed

  const api = createApi(authToken);

  useEffect(() => {
    if (!user || !authToken) {
      toast.error("Please log in to access this page");
      window.location.href = '/login';
      return;
    }

    if (user.user_type !== 'nmra_official') {
      toast.error("Access denied. NMRA officials only.");
      window.location.href = '/login';
      return;
    }
  }, [user, authToken]);

  const ensureCsrfToken = async () => {
    try {
      await api.get('/sanctum/csrf-cookie');
      return true;
    } catch (error) {
      toast.error("Network error. Please check if the server is running.");
      return false;
    }
  };

  const fetchApprovedPharmacists = async () => {
    try {
      setLoading(true);
      setError(null);
      const csrfSuccess = await ensureCsrfToken();
      if (!csrfSuccess) return;

      const response = await api.get('/api/nmra/approved-pharmacists');
      
      if (response.data.status) {
        const pharmacists = response.data.data;
        setApprovedPharmacists(pharmacists);
        setTotalResults(pharmacists.length);
        return pharmacists; //return the pharmacists array
      } else {
        toast.error(response.data.message || "Failed to fetch approved pharmacists");
        return [];
      }
    } catch (error) {
      console.error("Error fetching approved pharmacists:", error);
      setError("Failed to load approved pharmacists. Please try again.");
      toast.error("Failed to load approved pharmacists.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    
    if (!searchTerm.trim()) {
      toast.info("Please enter a search term");
      setFilteredResults([]);
      setHasSearched(true);
      return;
    }

    try {
      setSearching(true);
      setError(null);
      setHasSearched(true); //mark that a search has been performed
      
      const csrfSuccess = await ensureCsrfToken();
      if (!csrfSuccess) return;

      let pharmacists = approvedPharmacists;
      if (pharmacists.length === 0) {
        pharmacists = await fetchApprovedPharmacists();
      }

      const searchTermLower = searchTerm.toLowerCase().trim();
      const filtered = pharmacists.filter(pharmacist => {
        const searchFields = [
          pharmacist.pharmacist_name,
          pharmacist.first_name,
          pharmacist.last_name,
          pharmacist.email,
          pharmacist.slmc_reg_no,
          pharmacist.contact_no
        ].filter(Boolean);

        return searchFields.some(field => 
          field.toLowerCase().includes(searchTermLower)
        );
      });

      setFilteredResults(filtered);
      
      if (filtered.length === 0) {
        setError(`No pharmacists found matching "${searchTerm}"`);
      }
    } catch (error) {
      console.error("Error searching pharmacists:", error);
      setError("Error searching pharmacists. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleRevoke = async () => {
    if (!revocationReason.trim()) {
      toast.error("Please provide a revocation reason");
      return;
    }

    try {
      setLoading(true);
      const csrfSuccess = await ensureCsrfToken();
      if (!csrfSuccess) return;

      await api.post(`/api/nmra/pharmacist/${selectedPharmacist.id}/revoke-approved`, {
        reason: revocationReason
      });

      toast.success("Pharmacist approval revoked successfully");
      setShowModal(false);
      setRevocationReason("");
      setSelectedPharmacist(null);
      
      //refresh the search results after revocation
      if (searchTerm.trim()) {
        await handleSearch();
      } else {
        setFilteredResults([]);
      }
    } catch (error) {
      console.error("Error revoking pharmacist:", error);
      toast.error(error.response?.data?.message || "Failed to revoke pharmacist approval");
    } finally {
      setLoading(false);
    }
  };

  const openRevokeModal = (pharmacist) => {
    setSelectedPharmacist(pharmacist);
    setShowModal(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFilteredResults([]);
    setHasSearched(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 py-4 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-green-700 to-yellow-500 bg-clip-text text-transparent">
            Revoke Pharmacist Approval
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Search for approved pharmacists and revoke their NMRA approval if needed
          </p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-green-100 p-6 mb-6">
          <h5 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="bi bi-search text-yellow-500 text-lg"></i>
            Search Approved Pharmacists
          </h5>
          
          <div className="grid grid-cols-1 lg:grid-cols-9 gap-4">
            {/* Search Input */}
            <div className="lg:col-span-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search by Name, Email, or SLMC Registration Number
              </label>
              <div className="relative">
                <input type="text" placeholder="Enter pharmacist name, email, or SLMC registration number..."
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={handleKeyPress}disabled={searching}
                  className="w-full pl-10 pr-8 py-2 border-2 border-yellow-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all placeholder-gray-400 hover:border-yellow-500 disabled:opacity-50" />
                
                {searchTerm && (
                  <button onClick={clearSearch} disabled={searching} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50 p-0.5">
                  </button>
                )}
              </div>
            </div>

            <div className="lg:col-span-3 flex items-end">
              <button  onClick={handleSearch}  disabled={searching || !searchTerm.trim()}  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-md">
                {searching ? (
                  <>
                    Searching...
                  </>
                ) : (
                  <>
                    Search Approved
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-4 bg-red-100 border-2 border-red-400 rounded-lg flex items-center gap-3">
              <i className="bi bi-exclamation-triangle text-red-500 text-xl flex-shrink-0"></i>
              <p className="text-red-700 font-semibold">{error}</p>
            </div>
          )}
        </div>

        {/* Results table */}
        {hasSearched && filteredResults.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-green-100">
            <div className="p-4 border-b border-green-100">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">
                  Search Results ({filteredResults.length})
                </h3>
                <button onClick={clearSearch} className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1">
                  Clear Search
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-green-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase">No</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase">Pharmacist Details</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase">Contact</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase">SLMC No</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase">Approval Date</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((pharmacist, index) => (
                    <tr key={pharmacist.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">{index + 1}</td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{pharmacist.pharmacist_name}</div>
                        <div className="text-xs text-gray-500">
                          {pharmacist.first_name} {pharmacist.last_name}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div>{pharmacist.email}</div>
                        {pharmacist.contact_no && (
                          <div className="text-xs text-gray-500">{pharmacist.contact_no}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge bg="primary" className="px-2 py-1">
                          {pharmacist.slmc_reg_no}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(pharmacist.approved_at || pharmacist.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <button onClick={() => openRevokeModal(pharmacist)} className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-1 text-sm" disabled={loading}>
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No results  */}
        {hasSearched && filteredResults.length === 0 && !loading && !searching && (
          <div className="text-center py-12 bg-white rounded-xl shadow border-2 border-green-100">
            <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-green-200">
              <i className="bi bi-search text-2xl text-green-600"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">
              No Approved Pharmacists Found
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {searchTerm 
                ? `No pharmacists found matching "${searchTerm}"` 
                : "Please enter a search term to find pharmacists"}
            </p>
            <button onClick={clearSearch} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2 mx-auto">
              Back to Search
            </button>
          </div>
        )}

        {!hasSearched && (
          <div className="text-center py-12 bg-white rounded-xl shadow border-2 border-green-100">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Search for Pharmacists
            </h3>
            <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <i className="bi bi-info-circle text-blue-500"></i>
                Search by name, email, or SLMC number
              </div>
            </div>
          </div>
        )}

        {/*Revoke*/}
 {showModal && selectedPharmacist && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-gray-200">
      
      {/* Header */}
      <div className="bg-red-50 border-b border-red-100 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Revoke Approval</h2>
            </div>
          </div>
          <button className="text-gray-500 hover:text-gray-700 text-xl">
            &times; 
          </button>
        </div>
      </div>

  <div className="p-6">
        <p className="text-gray-600 mb-4">
          Are you sure you want to revoke approval for{" "}
          <strong>{selectedPharmacist?.pharmacist_name}</strong>?
        </p>      
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Revocation Reason
          </label>
          <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition" placeholder="Please provide a reason for revoking approval" rows="3" value={revocationReason} onChange={(e) => setRevocationReason(e.target.value)}/>
        </div>
      </div>

      <div className="border-t border-gray-200 p-6 flex justify-end gap-3">
        <button onClick={() => setShowModal(false)} className="px-4 py-2 border text-white rounded-lg bg-gray-500 hover:bg-gray-600 transition">
          Cancel
        </button>
        <button onClick={handleRevoke} disabled={loading} className={`px-4 py-2 rounded-lg transition ${
            loading 
              ? 'bg-red-300 cursor-not-allowed' 
              : 'bg-red-600 hover:bg-red-700'} text-white`}>
          {loading ? (
            <span className="flex items-center gap-2">
              Revoking...
            </span>
          ) : (
            'Confirm Revocation'
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
export default RevokeApprovedPharmacist;