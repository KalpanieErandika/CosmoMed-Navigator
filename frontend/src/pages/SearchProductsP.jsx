import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch, FaFilter, FaExclamationTriangle } from "react-icons/fa";
import { MdCategory, MdInfo, MdDownload } from "react-icons/md";
import { BiLoaderAlt } from "react-icons/bi";

const SearchProductsP = () => {
  const [type, setType] = useState("Medicines");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log('🔍 SearchProductsP component MOUNTED');
    console.log('Current path:', window.location.pathname);
    console.log('User:', JSON.parse(localStorage.getItem('userInfo')));
  }, []);

  const productTypes = [
    "Medicines",
    "Cosmetics", 
    "Borderline Products",
    "Precursor Chemicals",
    "Narcotic Drugs",
    "Psychotropic Substances"
  ];

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter a search term");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await axios.get("http://localhost:8000/api/search-products", {
        params: { type, query },
      });
      setResults(res.data);
    } catch (err) {
      console.error(err);
      setError("Error fetching data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const exportToCSV = () => {
    if (results.length === 0) return;
    
    const headers = Object.keys(results[0]).join(',');
    const csvData = results.map(row => 
      Object.values(row).map(value => `"${value}"`).join(',')
    ).join('\n');
    
    const csv = `${headers}\n${csvData}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nmra-products-${type}-${query}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
<div className="min-h-full bg-gradient-to-br from-blue-50 to-green-50 p-6">
  <div className="max-w-full flex flex-col items-center"> {/* Added flex container for centering */}
    
    {/* Header Section - Centered */}
    <div className="mb-8 text-center w-full max-w-4xl"> {/* Added text-center and max width */}
      <h1 className="text-3xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
        Product Search
      </h1>
      <p className="text-gray-600 text-lg">
        Search through NMRA registered pharmaceutical products and regulated substances
      </p>
    </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            {/* Category Select - FIXED */}
            <div className="lg:col-span-3">
              <div className="flex items-center gap-2 mb-2">
                <FaFilter className="text-yellow-500 text-lg" />
                <span className="text-sm font-semibold text-gray-700">
                  Product Category
                </span>
              </div>
              <div className="relative">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-yellow-400 rounded-lg bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all appearance-none cursor-pointer hover:border-yellow-500"
                >
                  {productTypes.map((productType) => (
                    <option key={productType} value={productType}>
                      {productType}
                    </option>
                  ))}
                </select>
                <MdCategory className="absolute right-3 top-3 text-yellow-500 text-xl pointer-events-none" />
              </div>
            </div>

            {/* Search Input - FIXED */}
            <div className="lg:col-span-6">
              <span className="text-sm font-semibold text-gray-700 mb-2 inline-block">
                Search Term
              </span>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Enter product name, registration number, or active ingredient..."
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 border-2 border-yellow-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all placeholder-gray-400 hover:border-yellow-500"
                />
                <FaSearch className="absolute right-3 top-3 text-yellow-500" />
              </div>
            </div>

            {/* Search Button */}
            <div className="lg:col-span-3">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <BiLoaderAlt className="animate-spin text-lg" />
                ) : (
                  <FaSearch className="text-lg" />
                )}
                {loading ? "Searching..." : "Search Products"}
              </button>
            </div>
          </div>

          {/* Error Message - FIXED */}
          {error && (
            <div className="mt-4 p-4 bg-red-100 border-2 border-red-400 rounded-lg flex items-center gap-3">
              <FaExclamationTriangle className="text-red-500 text-xl flex-shrink-0" />
              <p className="text-red-700 font-semibold">{error}</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        {results.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-yellow-200 overflow-hidden">
            {/* Results Header - FIXED */}
            <div className="px-6 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold">
                  Search Results
                </h2>
                <p className="text-yellow-100 text-lg">
                  Found <span className="font-bold">{results.length}</span> {type.toLowerCase()} matching "<span className="font-bold">{query}</span>"
                </p>
              </div>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 bg-white hover:bg-yellow-50 text-yellow-700 font-bold px-4 py-2 rounded-lg transition-all border-2 border-white shadow-lg hover:shadow-xl"
              >
                <MdDownload className="text-lg" />
                Export CSV
              </button>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow">
                <thead className="bg-green-800 text-white">
                  <tr>
                    {Object.keys(results[0]).map((key) => (
                      <th
                        key={key}
                        className="px-3 py-2 border text-left capitalize font-semibold"
                      >
                        {key.replaceAll("_", " ")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((item, i) => (
                    <tr key={i} className="odd:bg-gray-100 even:bg-white hover:bg-gray-300">
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
          /* Empty State - FIXED */
          <div className="text-center py-12">
            <div className="bg-white rounded-xl shadow-lg border border-yellow-200 p-8 max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-yellow-300">
                <MdInfo className="text-3xl text-yellow-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                {query ? "No Products Found" : "Search Products"}
              </h3>
              <p className="text-gray-600 text-lg mb-6">
                {query
                  ? `No ${type.toLowerCase()} found matching "${query}". Try different search terms.`
                  : "Enter a search term to find products in the NMRA database."}
              </p>
              <button
                onClick={() => {
                  setType("Medicines");
                  setQuery("Paracetamol");
                }}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                Try Example Search
              </button>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {results.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-green-400 to-green-500 text-white rounded-xl p-6 text-center shadow-lg">
              <div className="text-3xl font-bold">{results.length}</div>
              <div className="text-green-100 font-semibold">Products Found</div>
            </div>
            <div className="bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-xl p-6 text-center shadow-lg">
              <div className="text-3xl font-bold">{type}</div>
              <div className="text-blue-100 font-semibold">Category</div>
            </div>
            <div className="bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-xl p-6 text-center shadow-lg">
              <div className="text-3xl font-bold">"{query}"</div>
              <div className="text-purple-100 font-semibold">Search Query</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchProductsP;