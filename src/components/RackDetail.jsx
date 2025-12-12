import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../utils/utilRequest";
import AddItemModal from "../modals/add_item_modal";
import Excel from "../assets/icons/excel.png";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function RackDetail() {
  const { rackNumber } = useParams();
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]); // 🧩 NEW
  const [filters, setFilters] = useState({}); // 🧩 NEW
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null }); // 🧩 NEW
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [flashingSlots, setFlashingSlots] = useState({});


  // toggleFlash fonksiyonu
  const toggleFlash = (id) => {
    setFlashingSlots((prev) => ({
      ...prev,
      [id]: !prev[id], // true ise false, false ise true yap
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await API.rack_data();
        const allSlots = response.data;
        const rackSlots = allSlots
          .filter((item) => item.rack === Number(rackNumber))
          .map((slot) => ({ ...slot, isEdited: false }));
        setRows(rackSlots);
        setFilteredRows(rackSlots); // 🧩 initialize filter
      } catch (error) {
        console.error("Error getting data:", error);
      }
    };
    fetchData();
  }, [rackNumber]);



  // 🧩 Handle filter input change
  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);

    let filtered = rows.filter((row) =>
      Object.keys(newFilters).every((key) => {
        if (!newFilters[key]) return true;
        return String(row[key] || "")
          .toLowerCase()
          .includes(newFilters[key].toLowerCase());
      })
    );
    setFilteredRows(filtered);
  };


  // 🧩 Save edited row
  const handleSave = async (slot) => {
    try {
      const payload = {
        product_code: slot.product_code,
        description: slot.description,
        standard: slot.standard,
        unit_weight_gram: Number(slot.unit_weight_gram) || 0,
        quantity: Number(slot.quantity) || 0,
        total_weight_kg:
          ((Number(slot.unit_weight_gram) || 0) * (Number(slot.quantity) || 0)) /
          1000,
      };

      await API.update_rack(slot.id, payload);
      alert(`Tray ${slot.id} updated successfully ✅`);

      // update local state (reset isEdited)
      setRows((prev) =>
        prev.map((r) => (r.id === slot.id ? { ...r, ...payload, isEdited: false } : r))
      );
      setFilteredRows((prev) =>
        prev.map((r) => (r.id === slot.id ? { ...r, ...payload, isEdited: false } : r))
      );
    } catch (error) {
      console.error("Error updating rack:", error);
      alert("❌ Error updating rack slot. Check console for details.");
    }
  };

  // 🧩 Delete row
  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete tray ${id}?`)) return;

    try {
      await API.delete_rack(id);
      alert(`Tray ${id} deleted successfully ✅`);

      setRows((prev) => prev.filter((r) => r.id !== id));
      setFilteredRows((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Error deleting rack:", error);
      alert("❌ Error deleting rack slot. Check console for details.");
    }
  };


  // 🧩 Handle sorting toggle
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredRows].sort((a, b) => {
      const aVal = a[key] ?? "";
      const bVal = b[key] ?? "";
      if (typeof aVal === "number" && typeof bVal === "number") {
        return direction === "asc" ? aVal - bVal : bVal - aVal;
      }
      return direction === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    setFilteredRows(sorted);
  };

  // existing handlers (handleChange, handleSave, handleDelete, etc.) remain same...
  const handleChange = (id, field, value) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === id ? { ...row, [field]: value, isEdited: true } : row
      )
    );

    setFilteredRows((prevRows) =>
      prevRows.map((row) =>
        row.id === id ? { ...row, [field]: value, isEdited: true } : row
      )
    );
  };
  const headers = [
    { label: "Level", key: "level" },
    { label: "Tray", key: "id" },
    { label: "RFID", key: "rfid" },
    { label: "Product Code", key: "product_code" },
    { label: "Description", key: "description" },
    { label: "Standart", key: "standard" },
    { label: "Unit Weight (g)", key: "unit_weight_gram" },
    { label: "Qty", key: "quantity" },
    { label: "Total (kg)", key: "total_weight_kg" },
  ];

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Rack {rackNumber} Details</h2>
        <div className="d-flex gap-2">
          <button
            className="p-0 border-0 bg-transparent"
            onClick={() => exportToExcel()}
          >
            <img src={Excel} alt="Export" style={{ width: 30, height: 30 }} />
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/autoshelves")}
          >
            &larr; Back
          </button>
        </div>
      </div>


      <div className="table-responsive">
        <table
          className="table table-bordered table-sm align-middle text-center"
          style={{ borderColor: "#d3d3d3", fontSize: "0.8rem" }}
        >
          <thead>
            <tr>
              {headers.map(({ label, key }) => (
                <th
                  key={key}
                  style={{
                    backgroundColor: "#002B5B",
                    color: "white",
                    cursor: "pointer",
                  }}
                  onClick={() => handleSort(key)} // 🧩 Sort by column
                >
                  {label}{" "}
                  {sortConfig.key === key
                    ? sortConfig.direction === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
              ))}
              <th style={{ backgroundColor: "#002B5B", color: "white" }}>
                Flash
              </th>
              <th style={{ backgroundColor: "#002B5B", color: "white" }}>
                Actions
              </th>
            </tr>

            {/* 🧩 Filter Row */}
            <tr>
              {headers.map(({ key }) => (
                <th key={key}>
                  <input
                    type="text"
                    className="form-control form-control-sm text-center"
                    placeholder="Filter..."
                    value={filters[key] || ""}
                    onChange={(e) =>
                      handleFilterChange(key, e.target.value)
                    }
                    style={{ fontSize: "0.7rem" }}
                  />
                </th>
              ))}
              <th colSpan={2}></th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.map((slot) => {
              const isFlashing = flashingSlots[slot.id] || false; // <--- burada doğru
              return (
                <tr key={slot.id}>
                  <td>{slot.level}</td>
                  <td className="fw-bold text-uppercase">{slot.id}</td>
                  <td>{slot.rfid}</td>
                  <td>
                    <input
                      className="form-control form-control-sm text-center"
                      value={slot.product_code}
                      onChange={(e) => handleChange(slot.id, "product_code", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="form-control form-control-sm text-center"
                      value={slot.description}
                      onChange={(e) => handleChange(slot.id, "description", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="form-control form-control-sm text-center"
                      value={slot.standard || ""}
                      onChange={(e) => handleChange(slot.id, "standard", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="form-control form-control-sm text-center"
                      value={slot.unit_weight_gram}
                      onChange={(e) => handleChange(slot.id, "unit_weight_gram", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="form-control form-control-sm text-center"
                      value={slot.quantity}
                      onChange={(e) => handleChange(slot.id, "quantity", e.target.value)}
                    />
                  </td>
                  <td>{((slot.unit_weight_gram || 0) * (slot.quantity || 0) / 1000).toFixed(2)}</td>
                  <td>
                    <button
                      className={`btn btn-sm text-white ${isFlashing ? "flash-red" : ""}`}
                      style={{ backgroundColor: "#002B5B" }}
                      onClick={() => toggleFlash(slot.id)}
                    >
                      Flash
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm me-2"
                      disabled={!slot.isEdited}
                      onClick={() => handleSave(slot)}
                      style={{
                        backgroundColor: slot.isEdited ? "#002B5B" : "#6c757d",
                        color: "white",
                      }}
                    >
                      Save
                    </button>
                    <button
                      className="btn btn-sm btn-warning text-white"
                      onClick={() => handleDelete(slot.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>


        </table>
      </div>

    </div>
  );
}

export default RackDetail;
