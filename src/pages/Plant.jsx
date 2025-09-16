"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Edit, Trash2, Eye, Printer, X, Download } from "lucide-react";
import { plantsAPI, plantTypesAPI, companiesAPI, countriesAPI, statesAPI, citiesAPI } from "../services/api";

/* ---------------- helpers ---------------- */

// Normalize various API shapes into arrays
const toArray = (maybe) => {
  if (Array.isArray(maybe)) return maybe;
  if (Array.isArray(maybe?.data)) return maybe.data;
  if (Array.isArray(maybe?.items)) return maybe.items;
  if (Array.isArray(maybe?.results)) return maybe.results;
  return [];
};

// Pull a stable id
const getId = (obj) => obj?.id ?? obj?._id ?? obj?.value ?? obj?.key ?? undefined;

// Always-unique key even if ids are missing/duplicated
const keyWithIndex = (prefix, item, idx) => `${prefix}-${getId(item) ?? item?.name ?? item?.plantName ?? "x"}-${idx}`;

// Safely turn mixed shapes (string or object) into labels for display/filtering
const labelPlantType = (val) =>
  typeof val === "string" ? val : val?.plantType ?? val?.name ?? "";
const labelCountry = (val) =>
  typeof val === "string" ? val : val?.countryName ?? val?.name ?? "";
const labelState = (val) =>
  typeof val === "string" ? val : val?.stateName ?? val?.name ?? "";
const labelCity = (val) =>
  typeof val === "string" ? val : val?.cityName ?? val?.name ?? "";

/* ---------------- component ---------------- */

const Plant = () => {
  const [showForm, setShowForm] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedPlantQR, setSelectedPlantQR] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    plantName: "",
    plantType: "",
    plantCountry: "",
    plantState: "",
    plantCity: "",
  });

  const [plants, setPlants] = useState([]);
  const [plantTypes, setPlantTypes] = useState([]);
  const [companies, setCompanies] = useState([]); // reserved for future use
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Guaranteed arrays for safe mapping
  const plantsArr = useMemo(() => toArray(plants), [plants]);
  const plantTypesArr = useMemo(() => toArray(plantTypes), [plantTypes]);
  const companiesArr = useMemo(() => toArray(companies), [companies]);
  const countriesArr = useMemo(() => toArray(countries), [countries]);
  const statesArr = useMemo(() => toArray(states), [states]);
  const citiesArr = useMemo(() => toArray(cities), [cities]);

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError("");
      const [plantsRes, plantTypesRes, companiesRes, countriesRes, statesRes, citiesRes] = await Promise.all([
        plantsAPI.getAll(),
        plantTypesAPI.getAll(),
        companiesAPI.getAll(),
        countriesAPI.getAll(),
        statesAPI.getAll(),
        citiesAPI.getAll(),
      ]);

      setPlants(toArray(plantsRes?.data ?? plantsRes?.items ?? plantsRes?.results ?? plantsRes));
      setPlantTypes(toArray(plantTypesRes?.data ?? plantTypesRes?.items ?? plantTypesRes?.results ?? plantTypesRes));
      setCompanies(toArray(companiesRes?.data ?? companiesRes?.items ?? companiesRes?.results ?? companiesRes));
      setCountries(toArray(countriesRes?.data ?? countriesRes?.items ?? countriesRes?.results ?? countriesRes));
      setStates(toArray(statesRes?.data ?? statesRes?.items ?? statesRes?.results ?? statesRes));
      setCities(toArray(citiesRes?.data ?? citiesRes?.items ?? citiesRes?.results ?? citiesRes));
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data");
      setPlants([]); setPlantTypes([]); setCompanies([]); setCountries([]); setStates([]); setCities([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintClick = (plant) => {
    setSelectedPlantQR({
      plantName: plant?.plantName ?? "",
      qrCode: plant?.plantQr ?? "",
    });
    setShowQRModal(true);
  };

  const downloadQR = () => {
    if (selectedPlantQR?.qrCode) {
      const link = document.createElement("a");
      link.href = selectedPlantQR.qrCode;
      link.download = `${selectedPlantQR.plantName || "plant"}_QR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      await plantsAPI.create(formData);

      await fetchAllData();

      setShowForm(false);
      setFormData({
        plantName: "",
        plantType: "",
        plantCountry: "",
        plantState: "",
        plantCity: "",
      });
    } catch (err) {
      console.error("Error creating plant:", err);
      setError(err?.message || "Failed to create plant");
    } finally {
      setLoading(false);
    }
  };

  // Filtering with safe labels
  const term = searchTerm.trim().toLowerCase();
  const filteredPlants = useMemo(() => {
    if (!term) return plantsArr;
    return plantsArr.filter((p) => {
      const name = (p?.plantName ?? "").toLowerCase();
      const type = labelPlantType(p?.plantType).toLowerCase();
      const country = labelCountry(p?.plantCountry).toLowerCase();
      const state = labelState(p?.plantState).toLowerCase();
      const city = labelCity(p?.plantCity).toLowerCase();
      return [name, type, country, state, city].some((v) => v.includes(term));
    });
  }, [plantsArr, term]);

  /* ---------------- form view ---------------- */

  if (showForm) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Plant</h1>
          <button onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">
            ← Back to List
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plant Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="plantName"
                value={formData.plantName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plant Type<span className="text-red-500">*</span>
              </label>
              <select
                name="plantType"
                value={formData.plantType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Plant Type</option>
                {plantTypesArr.map((type, idx) => (
                  <option key={keyWithIndex("ptype", type, idx)} value={labelPlantType(type)}>
                    {labelPlantType(type) || "Unnamed"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plant Country<span className="text-red-500">*</span>
              </label>
              <select
                name="plantCountry"
                value={formData.plantCountry}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Country</option>
                {countriesArr.map((country, idx) => {
                  const label = labelCountry(country);
                  return (
                    <option key={keyWithIndex("country", country, idx)} value={label}>
                      {label || "Unnamed"}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plant State<span className="text-red-500">*</span>
              </label>
              <select
                name="plantState"
                value={formData.plantState}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select State</option>
                {statesArr
                  .filter((state) => labelCountry(state?.country) === formData.plantCountry)
                  .map((state, idx) => {
                    const label = labelState(state);
                    const value = label || state?.stateName || state?.name || "";
                    return (
                      <option key={keyWithIndex("state", state, idx)} value={value}>
                        {value || "Unnamed"}
                      </option>
                    );
                  })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plant City<span className="text-red-500">*</span>
              </label>
              <select
                name="plantCity"
                value={formData.plantCity}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select City</option>
                {citiesArr
                  .filter(
                    (city) =>
                      labelCountry(city?.country) === formData.plantCountry &&
                      labelState(city?.state) === formData.plantState
                  )
                  .map((city, idx) => {
                    const label = labelCity(city);
                    const value = label || city?.cityName || city?.name || "";
                    return (
                      <option key={keyWithIndex("city", city, idx)} value={value}>
                        {value || "Unnamed"}
                      </option>
                    );
                  })}
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Plant"}
            </button>
          </div>
        </form>

        {/* Decorative cards */}
        <div className="fixed bottom-8 right-8">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 transform rotate-12 rounded-lg shadow-lg flex items-center justify-center">
              <div className="text-white text-center">
                <div className="text-xs font-medium">Total Visitors</div>
                <div className="text-2xl font-bold">0</div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-purple-500 to-purple-700 transform -rotate-12 rounded-lg shadow-lg flex items-center justify-center">
              <div className="text-white text-center">
                <div className="text-xs font-medium">Check-In</div>
                <div className="text-xs font-medium">Visitors</div>
                <div className="text-2xl font-bold">0</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- list view ---------------- */

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Plant</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plant Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plant Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  State
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Print
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    Loading plants...
                  </td>
                </tr>
              ) : filteredPlants.length === 0 ? (
                <tr key="empty-row">
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    No plants found
                  </td>
                </tr>
              ) : (
                filteredPlants.map((plant, idx) => {
                  const isActive = Boolean(plant?.isPlantActive);
                  return (
                    <tr key={getId(plant) ?? `${plant?.plantName ?? "plant"}-${idx}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-600 hover:bg-gray-50 rounded" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{plant?.plantName ?? "N/A"}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {labelPlantType(plant?.plantType) || "N/A"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {labelCountry(plant?.plantCountry) || "N/A"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {labelState(plant?.plantState) || "N/A"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {labelCity(plant?.plantCity) || "N/A"}
                      </td>

                      {/* STATUS based on isPlantActive */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                          onClick={() => handlePrintClick(plant)}
                          title="Print QR"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">{Math.min(10, filteredPlants.length)}</span> of{" "}
                <span className="font-medium">{filteredPlants.length}</span> Entries
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">««</button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">‹</button>
              <button className="px-3 py-1 text-sm bg-blue-600 text-white border border-blue-600 rounded">1</button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">›</button>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">»»</button>
              <select className="ml-2 px-2 py-1 text-sm border border-gray-300 rounded">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {showQRModal && selectedPlantQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Plant QR Code</h2>
              <button onClick={() => setShowQRModal(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-800 mb-4">{selectedPlantQR.plantName}</h3>

              {selectedPlantQR.qrCode ? (
                <div className="mb-6">
                  <img
                    src={selectedPlantQR.qrCode || "/placeholder.svg"}
                    alt={`QR Code for ${selectedPlantQR.plantName}`}
                    className="mx-auto border border-gray-200 rounded-lg"
                    style={{ width: "200px", height: "200px" }}
                  />
                </div>
              ) : (
                <div className="mb-6 flex items-center justify-center w-48 h-48 mx-auto border border-gray-200 rounded-lg bg-gray-50">
                  <span className="text-gray-500">No QR Code Available</span>
                </div>
              )}

              <div className="flex space-x-3 justify-center">
                <button
                  onClick={downloadQR}
                  disabled={!selectedPlantQR.qrCode}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  <span>Download QR</span>
                </button>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Decorative cards */}
      <div className="fixed bottom-8 right-8">
        <div className="relative">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 transform rotate-12 rounded-lg shadow-lg flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-xs font-medium">Check-In</div>
              <div className="text-xs font-medium">Visitors</div>
              <div className="text-2xl font-bold">0</div>
            </div>
          </div>
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-purple-500 to-purple-700 transform -rotate-12 rounded-lg shadow-lg flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-xs font-medium">Check-In</div>
              <div className="text-xs font-medium">Visitors</div>
              <div className="text-2xl font-bold">0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plant;
