import React, { useState } from "react";
import axios from "axios";
import { FaSearch, FaFilter, FaExclamationTriangle } from "react-icons/fa";
import { MdCategory, MdInfo, MdDownload } from "react-icons/md";
import { BiLoaderAlt } from "react-icons/bi";

const SearchEntitiesP = () => {
  const [type, setType] = useState("Pharmacies");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const entityTypes = [
    "Pharmacies",
    "Drug Manufacturers", 
    "Importers",
    "Exporters"
  ];

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter a search term");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await axios.get("http://localhost:8000/api/search-entities", {
        params: { type: type.trim(), query: query.trim() },
      });
      setResults(res.data);
    } catch (err) {
      console.error(err.response ? err.response.data : err.message);
      setError("Error fetching data: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-full">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Entity Search
          </h1>
          <p className="text-gray-600 text-lg">
            Search through NMRA registered entities and organizations
          </p>
        </div>


        <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">

            {/* Category Select */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaFilter className="text-yellow-500 text-lg" />
                Entity Type
              </label>

              <div className="relative">
                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-4 py-3 border-2 border-yellow-400 rounded-lg bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all appearance-none cursor-pointer hover:border-yellow-500">
                  {entityTypes.map((entityType) => (
                    <option key={entityType} value={entityType}>
                      {entityType}
                    </option>
                  ))}
                </select>
                <MdCategory className="absolute right-3 top-3 text-yellow-500 text-xl pointer-events-none" />
              </div>
            </div>

            {/* Search Input */}
            <div className="lg:col-span-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Term
              </label>
              <div className="relative">
                <input type="text" placeholder="Enter entity name..." value={query} onChange={(e) => setQuery(e.target.value)}onKeyPress={handleKeyPress}
      className="w-full px-4 py-3 border-2 border-yellow-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all placeholder-gray-400 hover:border-yellow-500"/>
                <FaSearch className="absolute right-3 top-3 text-yellow-500" />
              </div>
            </div>

         <div className="lg:col-span-3">
  <button onClick={handleSearch} disabled={loading} className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl">
    {loading ? "Searching..." : "Search Entities"}
  </button>
</div>
          </div>


          {error && (
            <div className="mt-4 p-4 bg-red-100 border-2 border-red-400 rounded-lg flex items-center gap-3">
              <FaExclamationTriangle className="text-red-500 text-xl flex-shrink-0" />
              <p className="text-red-700 font-semibold">{error}</p>
            </div>
          )}
        </div>


        {results.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-yellow-200 overflow-hidden">
            {/* Results Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow">
                <thead className="bg-green-800 text-white">
                  <tr>
                    {Object.keys(results[0]).map((key) => (
                      <th key={key} className="px-3 py-2 border text-left capitalize font-semibold">
                        {key.replaceAll("_", " ")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((item, i) => (
                    <tr key={i} className="odd:bg-white even:bg-gray-200 hover:bg-gray-300">
                      {Object.values(item).map((val, j) => (
                        <td key={j} className="px-3 py-2 border">
                          {val || "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-8 max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-yellow-300">
                <MdInfo className="text-3xl text-yellow-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                {query ? "No Entities Found" : "Search Entities"}
              </h3>
              <p className="text-gray-600 text-lg mb-6">
                {query
                  ? `No ${type.toLowerCase()} found matching "${query}". Try different search terms.`
                  : "Enter a search term to find entities in the NMRA database."}
              </p>

            </div>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default SearchEntitiesP;