import React, { useState, useEffect, useRef, useCallback } from "react";
import { GoogleMap, useJsApiLoader, InfoWindow, DirectionsRenderer,} from "@react-google-maps/api";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import Navbar from "../components/Navbar";

const containerStyle = { width: "100%", height: "500px" };
const center = { lat: 7.8731, lng: 80.7718 };

function PharmacyLocator() {
  const [pharmacies, setPharmacies] = useState([]);
  const [allPharmacies, setAllPharmacies] = useState([]);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);

  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("");
  const [moh, setMoh] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [stats, setStats] = useState({ total: 0, withCoords: 0 }); //pharmacies that have latitude and longitude

  const [userLocation, setUserLocation] = useState(null);
  const [radiusKm, setRadiusKm] = useState(5);

  const [directions, setDirections] = useState(null);
  const [distanceText, setDistanceText] = useState("");
  const [durationText, setDurationText] = useState("");
  const [travelMode, setTravelMode] = useState("DRIVING");

  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const clustererRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: " ",
    libraries: ["places"],
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        alert("Please allow location access to get directions.");
      },
      { enableHighAccuracy: true }
    );
  }, []);

  const getDistanceKm = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * //angular separation
        Math.sin(dLng / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };


  const fetchPharmacies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (district) params.append("district", district);

      const res = await fetch(
        `http://localhost:8000/api/pharmacies${
          params.toString() ? `?${params}` : ""
        }`
      );

      const data = await res.json();

      const cleaned = data
        .filter((p) => p.lat && p.lng) //remove pharmacies without coordinates
        .map((p) => ({  ...p, lat: parseFloat(p.lat), lng: parseFloat(p.lng), })); //convert lat and lng from strings to numbers using parseFloat

      setStats({ total: data.length, withCoords: cleaned.length });
      setAllPharmacies(cleaned);
      setPharmacies(cleaned);
      setDirections(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, district, moh]);

  useEffect(() => {
    fetchPharmacies();
  }, [fetchPharmacies]);


  const findNearbyPharmacies = () => {
    if (!userLocation) return alert("User location not available");

    const nearby = allPharmacies.filter(
      (p) =>
        getDistanceKm( userLocation.lat, userLocation.lng, p.lat, p.lng ) <= radiusKm
    );

    setPharmacies(nearby);
    setDirections(null);
  };

  const updateMarkers = () => {
    if (!mapRef.current) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    clustererRef.current?.clearMarkers(); //clear the map before adding new markers

    const markers = pharmacies.map((p) => {
      const marker = new window.google.maps.Marker({ //create a marker on the map
  position: { lat: p.lat, lng: p.lng },
  map: mapRef.current,
  title: p.pharmacy_name,
});
      marker.addListener("click", () => {
        setSelectedPharmacy(p);
        setDirections(null);
      });
      return marker;
    });

    markersRef.current = markers;
    clustererRef.current = new MarkerClusterer({
      markers,
      map: mapRef.current,
      styles: [
        { url: "/assets/images/m1.png",width: 56, height: 56, textColor: "#FFFFFF", textSize: 12,},
      ],
    });
  };

  useEffect(() => {
    if (mapLoaded) updateMarkers();
  }, [pharmacies, mapLoaded]);

  const onMapLoad = (map) => {
    mapRef.current = map;
    setMapLoaded(true);
  };

  const getDirections = () => {
  if (!userLocation || !selectedPharmacy) return alert("Location missing");

  new window.google.maps.DirectionsService().route(
    {
      origin: userLocation,
      destination: { lat: selectedPharmacy.lat,lng: selectedPharmacy.lng,},
      travelMode: window.google.maps.TravelMode.DRIVING, 
    },
    (result, status) => {
      if (status !== "OK") return alert("Directions unavailable");

      setDirections(result);
      const { distance, duration } = result.routes[0].legs[0]; //best route,one way
      setDistanceText(distance.text);
      setDurationText(duration.text);
    }
  );
};

  const resetFilters = () => {
    setSearch("");
    setDistrict("");
    setMoh("");
    setPharmacies(allPharmacies);
    setDirections(null);};


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Navbar />
      
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 py-2 mt-3">

  <header className="text-center mb-12 md:mb-1">
    <h1 className="text-3xl md:text-4xl font-bold mb-3">
      <span className="relative">
        <span className="text-emerald-800">Pharmacy</span>
        <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-emerald-800/30"></span>
      </span>
      <span className="relative ml-2">
        <span className="text-yellow-500">Locator</span>
        <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-yellow-500/30"></span>
      </span>
    </h1>
    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
      Discover healthcare services near you
    </p>
  </header>
</div>

        <div className="flex flex-wrap justify-center gap-6 mb-6 p-4 bg-gray-200 rounded-lg shadow-sm">
          <div className="flex flex-col items-center">
            <span className="text-sm text-gray-600 mb-1">Total Registered Pharmacies</span>
            <span className="text-xl font-bold text-green-500">{stats.total}</span>
          </div>
        </div>

         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 ml-3">
      <div className="lg:col-span-1 space-y-6">
      
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  Search Filters
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enter Name
                    </label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition" placeholder="Enter pharmacy name..." value={search}
    onChange={(e) => setSearch(e.target.value)}            />
                  </div>
                </div>
  
                <div className="flex gap-3 mt-6">
                  <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 active:scale-95 transition"onClick={fetchPharmacies}>
                    Search
                  </button>
                  <button  className="flex-1 bg-yellow-500 text-gray-700 py-2 px-4 rounded-lg font-medium border border-gray-300 hover:bg-yellow-600 active:scale-95 transition" onClick={resetFilters} >
                    Reset
                  </button>
                </div>
              </div>
  
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  Nearby Pharmacies
                </h3>
                
                <div className="space-y-4">
               <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Search Radius
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" value={radiusKm}
  onChange={(e) => setRadiusKm(Number(e.target.value))} >
                      <option value={2}>2 km</option>
                      <option value={5}>5 km</option>
                      <option value={10}>10 km</option>
                      <option value={20}>20 km</option>
                    </select>
                  </div>
  
                  <button className={`w-full py-3 px-4 rounded-lg font-medium transition active:scale-95 ${
                      userLocation 
                        ? "bg-green-600 text-white hover:bg-green-700" 
                        : "bg-gray-300 text-gray-500 cursor-not-allowed" }`} onClick={findNearbyPharmacies} disabled={!userLocation} >
                    {userLocation ? "Find Nearby Pharmacies" : "Getting Location..."}
                  </button>
  
                </div>
              </div>
            </div>
  
            <div className="lg:col-span-3 relative">
          
              <div className="rounded-xl overflow-hidden shadow-lg">
                <GoogleMap mapContainerStyle={containerStyle} center={userLocation || center} zoom={userLocation ? 12 : 7} onLoad={onMapLoad} options={{
                    styles: [
                      {featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
                    ]
                  }}>
  
                  {directions && <DirectionsRenderer directions={directions} />}
  
                  {selectedPharmacy && (
                    <InfoWindow position={{
            lat: selectedPharmacy.lat, lng: selectedPharmacy.lng, }} onCloseClick={() => setSelectedPharmacy(null)} >
  
                      <div className="p-2 max-w-[250px]">
                        <h4 className="font-semiboldQ text-gray-800 mb-2 text-sm">
                          {selectedPharmacy.pharmacy_name}
                        </h4>
                        <p className="text-gray-600 text-xs mb-3 leading-relaxed">
                          {selectedPharmacy.address}
                        </p>
                        
                        <div className="space-y-2">
                          <button className="w-full bg-yellow-500 text-white text-xs py-2 px-3 rounded hover:bg-yellow-600 transition"onClick={getDirections}>
                            Get Directions
                          </button>
                          
                          {distanceText && (
                            <div className="pt-2 border-t border-gray-200 space-y-2">
                              <div className="flex justify-between text-xs text-gray-700">
                                <span className="flex items-center gap-1">{distanceText}</span>
                                <span className="flex items-center gap-1">{durationText}</span>
                              </div>
                              
                              <button className="w-full bg-green-600 text-white text-xs py-2 px-3 rounded hover:bg-green-700 transition" onClick={() => window.open(
    `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${selectedPharmacy.lat},${selectedPharmacy.lng}`, "_blank")} >
                             Start Navigation
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              </div>
          </div>
        </div>
      </div>
  );
}

export default React.memo(PharmacyLocator); //skip re rendering
