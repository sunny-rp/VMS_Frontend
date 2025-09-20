// src/pages/Plant.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Edit, Trash2, Eye, Printer, X, Download } from "lucide-react";
import { plantsAPI, plantTypesAPI, companiesAPI, countriesAPI, statesAPI, citiesAPI } from "../services/api";

/* ---------------- helpers ---------------- */

const toArray = (maybe) => {
  if (Array.isArray(maybe)) return maybe;
  if (Array.isArray(maybe?.data)) return maybe.data;
  if (Array.isArray(maybe?.items)) return maybe.items;
  if (Array.isArray(maybe?.results)) return maybe.results;
  if (maybe?.data && typeof maybe.data === "object") return [maybe.data]; // tolerate single object
  return [];
};

const getId = (obj) => obj?.id ?? obj?._id ?? obj?.value ?? obj?.key ?? undefined;
const isObjectId = (s) => /^[0-9a-fA-F]{24}$/.test(s || "");

// extract id if the value is either an object with _id/id or already an id
const extractId = (val) => {
  if (!val) return "";
  if (typeof val === "string") return val;
  return getId(val) || val?._id || "";
};

// Make safe labels
const ptLabel = (x) => x?.plantType ?? x?.name ?? "";
const ctryLabel = (x) => x?.countryName ?? x?.name ?? "";
const stateLabel = (x) => x?.stateName ?? x?.name ?? "";
const cityLabel = (x) => x?.cityName ?? x?.name ?? "";

// Build an id->label map
const mapById = (array, labeler) =>
  array.reduce((acc, item) => {
    const id = extractId(item);
    if (id) acc[id] = labeler(item);
    return acc;
  }, {});

/* ---------------- simple confirm modal ---------------- */

const ConfirmDeleteModal = ({ open, title, message, onCancel, onConfirm, loading }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      aria-describedby="confirm-delete-desc"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={loading ? undefined : onCancel} />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h2 id="confirm-delete-title" className="text-lg font-semibold text-gray-900">
              {title || "Delete item"}
            </h2>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
              aria-label="Close"
            >
              <X size={22} />
            </button>
          </div>
          <p id="confirm-delete-desc" className="mt-3 text-sm text-gray-600">
            {message || "Are you sure you want to delete this item? This action cannot be undone."}
          </p>
        </div>
        <div className="flex justify-end gap-3 border-t bg-gray-50 p-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-md border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 inline-flex items-center gap-2"
          >
            <Trash2 size={16} />
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------- component ---------------- */

const Plant = () => {
  const [showForm, setShowForm] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedPlantQR, setSelectedPlantQR] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // IMPORTANT: these hold **IDs**
  const [formData, setFormData] = useState({
    plantName: "",
    plantType: "",     // ObjectId string
    plantCountry: "",  // ObjectId string
    plantState: "",    // ObjectId string
    plantCity: "",     // ObjectId string
  });
  const [editingId, setEditingId] = useState(null);

  const [plants, setPlants] = useState([]);
  const [plantTypes, setPlantTypes] = useState([]);
  const [companies, setCompanies] = useState([]); // reserved
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);   // fetch/save state
  const [deleting, setDeleting] = useState(false); // delete state
  const [error, setError] = useState("");

  // delete-confirm modal state
  const [confirm, setConfirm] = useState({ open: false, id: null, name: "" });

  // Normalize arrays
  const plantsArr = useMemo(() => toArray(plants), [plants]);
  const plantTypesArr = useMemo(() => toArray(plantTypes), [plantTypes]);
  const countriesArr = useMemo(() => toArray(countries), [countries]);
  const statesArr = useMemo(() => toArray(states), [states]);
  const citiesArr = useMemo(() => toArray(cities), [cities]);

  // Build option/label maps for display & filtering
  const ptMap = useMemo(() => mapById(plantTypesArr, ptLabel), [plantTypesArr]);
  const countryMap = useMemo(() => mapById(countriesArr, ctryLabel), [countriesArr]);
  const stateMap = useMemo(() => mapById(statesArr, stateLabel), [statesArr]);
  const cityMap = useMemo(() => mapById(citiesArr, cityLabel), [citiesArr]);

  // For dependent dropdowns, keep relationships as IDs
  const statesByCountry = useMemo(() => {
    const m = {};
    statesArr.forEach((s) => {
      const countryId = extractId(s.country);
      if (!m[countryId]) m[countryId] = [];
      m[countryId].push(s);
    });
    return m;
  }, [statesArr]);

  const citiesByState = useMemo(() => {
    const m = {};
    citiesArr.forEach((c) => {
      const stateId = extractId(c.state);
      if (!m[stateId]) m[stateId] = [];
      m[stateId].push(c);
    });
    return m;
  }, [citiesArr]);

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

      setPlants(toArray(plantsRes?.data ?? plantsRes));
      setPlantTypes(toArray(plantTypesRes?.data ?? plantTypesRes));
      setCompanies(toArray(companiesRes?.data ?? companiesRes));
      setCountries(toArray(countriesRes?.data ?? countriesRes));
      setStates(toArray(statesRes?.data ?? statesRes));
      setCities(toArray(citiesRes?.data ?? citiesRes));
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Reset child selects if parent changes
    if (name === "plantCountry") {
      setFormData((prev) => ({ ...prev, plantCountry: value, plantState: "", plantCity: "" }));
    } else if (name === "plantState") {
      setFormData((prev) => ({ ...prev, plantState: value, plantCity: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validatePayload = ({ plantName, plantType, plantCountry, plantState, plantCity }) => {
    if (!plantName.trim()) throw new Error("Plant name is required");
    if (!isObjectId(plantType)) throw new Error("Invalid Plant Type id");
    if (!isObjectId(plantCountry)) throw new Error("Invalid Country id");
    if (!isObjectId(plantState)) throw new Error("Invalid State id");
    if (!isObjectId(plantCity)) throw new Error("Invalid City id");
  };

  // CREATE or UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const payload = {
        plantName: formData.plantName,
        plantType: formData.plantType,
        plantCountry: formData.plantCountry,
        plantState: formData.plantState,
        plantCity: formData.plantCity,
      };

      validatePayload(payload);

      if (editingId) {
        await plantsAPI.update(editingId, payload);
      } else {
        await plantsAPI.create(payload);
      }

      await fetchAllData();

      setShowForm(false);
      setEditingId(null);
      setFormData({ plantName: "", plantType: "", plantCountry: "", plantState: "", plantCity: "" });
    } catch (err) {
      console.error("Error saving plant:", err);
      setError(err?.message || "Failed to save plant");
    } finally {
      setLoading(false);
    }
  };

  // Start editing a row (pre-fill with IDs)
  const startEdit = (plant) => {
    const id = extractId(plant);
    const pType = extractId(plant?.plantType);
    const pCountry = extractId(plant?.plantCountry);
    const pState = extractId(plant?.plantState);
    const pCity = extractId(plant?.plantCity);

    setEditingId(id);
    setFormData({
      plantName: plant?.plantName ?? "",
      plantType: pType || "",
      plantCountry: pCountry || "",
      plantState: pState || "",
      plantCity: pCity || "",
    });
    setShowForm(true);
    setError("");
  };

  // open confirmation modal instead of alert
  const promptDelete = (plant) => {
    const id = extractId(plant);
    const name = plant?.plantName || "";
    setConfirm({ open: true, id, name });
  };

  // perform delete (optimistic + rollback)
  const performDelete = async () => {
    const id = confirm.id;
    if (!id) {
      setConfirm({ open: false, id: null, name: "" });
      return;
    }

    try {
      setDeleting(true);
      setError("");

      if (!isObjectId(id)) throw new Error("Invalid plant id");

      // optimistic remove
      const prev = plants;
      setPlants((arr) => arr.filter((p) => extractId(p) !== id));

      try {
        await plantsAPI.delete(id); // ✅ DELETE /user/plants/delete-plant/:plantId
        await fetchAllData();       // ensure server truth
      } catch (err) {
        // rollback on failure
        setPlants(prev);
        throw err;
      } finally {
        setConfirm({ open: false, id: null, name: "" });
      }
    } catch (err) {
      console.error("Error deleting plant:", err);
      setError(err?.response?.data?.message || err?.message || "Failed to delete plant");
    } finally {
      setDeleting(false);
    }
  };

  // Filtering by visible labels using maps
  const term = searchTerm.trim().toLowerCase();
  const filteredPlants = useMemo(() => {
    const src = plantsArr;
    if (!term) return src;
    return src.filter((p) => {
      const name = (p?.plantName ?? "").toLowerCase();
      const type = (ptMap[extractId(p?.plantType)] || "").toLowerCase();
      const country = (countryMap[extractId(p?.plantCountry)] || "").toLowerCase();
      const state = (stateMap[extractId(p?.plantState)] || "").toLowerCase();
      const city = (cityMap[extractId(p?.plantCity)] || "").toLowerCase();
      return [name, type, country, state, city].some((v) => v.includes(term));
    });
  }, [plantsArr, term, ptMap, countryMap, stateMap, cityMap]);

  /* ---------------- form view ---------------- */

  if (showForm) {
    const allowedStates = statesByCountry[formData.plantCountry] || [];
    const allowedCities = citiesByState[formData.plantState] || [];

    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Plant</h1>
          <button
            onClick={() => {
              setShowForm(false);
              setEditingId(null);
              setFormData({ plantName: "", plantType: "", plantCountry: "", plantState: "", plantCity: "" });
              setError("");
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={loading || deleting}
          >
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
                disabled={loading || deleting}
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
                disabled={loading || deleting}
              >
                <option value="">Select Plant Type</option>
                {plantTypesArr.map((type) => {
                  const id = extractId(type);
                  return (
                    <option key={id} value={id}>
                      {ptLabel(type) || "Unnamed"}
                    </option>
                  );
                })}
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
                disabled={loading || deleting}
              >
                <option value="">Select Country</option>
                {countriesArr.map((country) => {
                  const id = extractId(country);
                  return (
                    <option key={id} value={id}>
                      {ctryLabel(country) || "Unnamed"}
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
                disabled={!formData.plantCountry || loading || deleting}
              >
                <option value="">Select State</option>
                {allowedStates.map((state) => {
                  const id = extractId(state);
                  return (
                    <option key={id} value={id}>
                      {stateLabel(state) || "Unnamed"}
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
                disabled={!formData.plantState || loading || deleting}
              >
                <option value="">Select City</option>
                {allowedCities.map((city) => {
                  const id = extractId(city);
                  return (
                    <option key={id} value={id}>
                      {cityLabel(city) || "Unnamed"}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-4">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setFormData({ plantName: "", plantType: "", plantCountry: "", plantState: "", plantCity: "" });
                setError("");
              }}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading || deleting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading || deleting}
            >
              {loading ? "Saving..." : editingId ? "Update Plant" : "Save Plant"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  /* ---------------- list view ---------------- */

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Plant</h1>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ plantName: "", plantType: "", plantCountry: "", plantState: "", plantCity: "" });
            setShowForm(true);
          }}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          disabled={loading || deleting}
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
                  const id = extractId(plant);
                  const ptName = ptMap[extractId(plant?.plantType)] || "N/A";
                  const countryName = countryMap[extractId(plant?.plantCountry)] || "N/A";
                  const stateName = stateMap[extractId(plant?.plantState)] || "N/A";
                  const cityName = cityMap[extractId(plant?.plantCity)] || "N/A";
                  const isActive = Boolean(plant?.isPlantActive);

                  return (
                    <tr key={id || `${plant?.plantName ?? "plant"}-${idx}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                            title="Delete"
                            onClick={() => promptDelete(plant)}
                            disabled={loading || deleting}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
                            title="Edit"
                            onClick={() => startEdit(plant)}
                            disabled={loading || deleting}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-600 hover:bg-gray-50 rounded disabled:opacity-50" title="View" disabled={loading || deleting}>
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{plant?.plantName?.toUpperCase() ?? "N/A"}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{ptName.toUpperCase()}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{countryName.toUpperCase()}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{stateName.toUpperCase()}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{cityName.toUpperCase()}</td>

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
                          className="p-1 text-orange-600 hover:bg-orange-50 rounded disabled:opacity-50"
                          onClick={() => handlePrintClick(plant)}
                          title="Print QR"
                          disabled={loading || deleting}
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
                  onClick={() => {
                    if (!selectedPlantQR.qrCode) return;
                    const link = document.createElement("a");
                    link.href = selectedPlantQR.qrCode;
                    link.download = `${selectedPlantQR.plantName || "plant"}_QR.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
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

      {/* Delete confirmation modal */}
      <ConfirmDeleteModal
        open={confirm.open}
        title="Delete plant"
        message={
          confirm.name
            ? `Are you sure you want to delete “${confirm.name}”? This action cannot be undone.`
            : "Are you sure you want to delete this plant? This action cannot be undone."
        }
        onCancel={() => setConfirm({ open: false, id: null, name: "" })}
        onConfirm={performDelete}
        loading={deleting}
      />

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
