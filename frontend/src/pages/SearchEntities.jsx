import React, { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { FaSearch } from "react-icons/fa";
import { MdCategory, MdInfo } from "react-icons/md";
import bgImage from "../assets/images/searchp.jpg";

const SearchEntities = () => {
  const [type, setType] = useState("Pharmacies");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (!query.trim()) return alert("Please enter a search term");

    try {
      const res = await axios.get("http://localhost:8000/api/search-entities", {
  params: { type: type.trim(), query: query.trim() },
});

      setResults(res.data);
    } catch (err) {
      console.error(err.response ? err.response.data : err.message);
      alert("Error fetching data: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />
      
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 py-2 mt-3">

  <header className="text-center mb-12 md:mb-1">
    <h1 className="text-3xl md:text-4xl font-bold mb-3">
      <span className="relative">
        <span className="text-emerald-800">Entity</span>
        <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-emerald-800/30"></span>
      </span>
      <span className="relative ml-2">
        <span className="text-yellow-500">Search</span>
        <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-yellow-500/30"></span>
      </span>
    </h1>
    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
      Search NMRA Registered Pharmacies, Drug Manufacturers, Exporters, and Importers
    </p>
  </header>
</div>

        <div className="bg-white/90 p-6 rounded-xl shadow-lg border backdrop-blur-sm mb-10 ml-40 mr-40">
          <div className="flex flex-col md:flex-row items-center gap-3">

            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 w-full md:w-auto">
            <MdCategory className="text-gray-600 text-xl mr-2" />
              <select value={type} onChange={(e) => setType(e.target.value)} className="bg-transparent outline-none text-gray-700">

                <option>Pharmacies</option>
                <option>Drug Manufacturers</option>
                <option>Importers</option>
                <option>Exporters</option>
              </select>
            </div>

            <input type="text" placeholder="Enter name..." value={query} onChange={(e) => setQuery(e.target.value)}
className="border rounded-lg px-3 py-2 w-full"/>

            <button onClick={handleSearch} className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg shadow transition" >
              <FaSearch />
              Search
            </button>
          </div>
        </div>

        {results.length > 0 ? (
          <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow ml-20 mr-20">
              <thead className="bg-green-800 text-white">
                <tr>
                {Object.keys(results[0]).map((key) => (
                    <th key={key} className="px-3 py-2 border text-left capitalize font-semibold" >
                      {key.replaceAll("_", " ")}
                    </th> ))}
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
         ) : (
                 
                  <div className="text-center py-12">
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 max-w-md mx-auto">
                      <MdInfo className="text-4xl text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        No Results Found
                      </h3>
                      <p className="text-gray-500">
                        {query
                          ? `No ${type.toLowerCase()} found for "${query}"`
                          : "Enter a search term to find products"}
                      </p>
                    </div>
                  </div>
                )}
      </div>
  );
};

export default SearchEntities;
