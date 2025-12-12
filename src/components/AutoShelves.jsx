import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import API from "../utils/utilRequest";

function AutoShelves() {
  const navigate = useNavigate();
  const [racks, setRacks] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null); // For modal

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await API.rack_data();
        const allSlots = response.data;

        const racks = allSlots.reduce((acc, item) => {
          if (!acc[item.rack]) acc[item.rack] = {};
          if (!acc[item.rack][item.level]) acc[item.rack][item.level] = [];
          acc[item.rack][item.level].push(item);
          return acc;
        }, {});

        setRacks(racks);
      } catch (error) {
        console.error("Error getting data:", error);
      }
    };

    fetchData();
  }, []);

  // Filtered rack keys
  const filteredRackKeys = Object.keys(racks).filter((rack) =>
    rack.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handleSave = async (slot) => {
    try {
      const payload = {
        product_code: slot.product_code,
        description: slot.description,
        standard: slot.standard,
        unit_weight_gram: Number(slot.unit_weight_gram) || 0,
        quantity: Number(slot.quantity) || 0,
        total_weight_kg:
          ((Number(slot.unit_weight_gram) || 0) * (Number(slot.quantity) || 0)) / 1000,
      };

      await API.update_rack(slot.id, payload);
      alert(`Tray ${slot.id} updated successfully ✅`);

      // 🔄 Refresh table
      await fetchRacks();
    } catch (error) {
      console.error("Error updating rack:", error);
      alert("❌ Error updating rack slot. Check console for details.");
    }
  };

  // useEffect
  useEffect(() => {
    fetchRacks();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchRacks();
    }, 5000);

    return () => clearInterval(interval);
  }, []);


  const fetchRacks = async () => {
    try {
      const response = await API.rack_data();
      const allSlots = response.data;

      const racksData = allSlots.reduce((acc, item) => {
        if (!acc[item.rack]) acc[item.rack] = {};
        if (!acc[item.rack][item.level]) acc[item.rack][item.level] = [];
        acc[item.rack][item.level].push(item);
        return acc;
      }, {});

      setRacks(racksData);
    } catch (error) {
      console.error("Error getting data:", error);
    }
  };

  return (
    <div className="container my-4">
      {/* 🔍 Search input */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search rack..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="row g-3">
        {filteredRackKeys.length === 0 ? (
          <div className="text-muted text-center py-5">No racks found.</div>
        ) : (
          filteredRackKeys.map((rack) => (
            <div key={rack} className="col-12">
              <div className="rack-container shadow-sm border-0 rounded-3">
                <div className="rack-header d-flex justify-content-between align-items-center p-3 border-bottom">
                  <h5 className="fw-bold mb-0">Rack {rack}</h5>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => navigate(`/rackdetail/${rack}`)}
                  >
                    Manage
                  </button>
                </div>

                <div className="rack-body p-3">
                  {Object.keys(racks[rack]).map((level) => (
                    <div key={level} className="rack-level mb-3">
                      <div className="rack-level-header fw-semibold mb-2">
                        Level {level}
                      </div>

                      <div className="rack-drawers d-flex flex-wrap gap-2">
                        {racks[rack][level].map((slot) => (
                          <button
                            key={slot.id}
                            className="drawer text-center flex-grow-1 p-2 rounded position-relative border-0"
                            style={{ backgroundColor: slot.color, color: "black" }} // text color set here
                            onClick={() => setSelectedSlot(slot)}
                          >
                            <div className="fw-bold small">{slot.product_code}</div>
                            <div style={{ fontSize: "0.75rem", color: "black" }}>{slot.quantity} pcs</div> {/* override text-muted */}
                          </button>
                        ))}

                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedSlot && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
          role="dialog"
          onClick={() => setSelectedSlot(null)}
        >
          <div
            className="modal-dialog"
            role="document"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedSlot.rfid}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedSlot(null)}
                />
              </div>
              <div className="modal-body">
                {/* Product Code */}
                <div className="mb-2">
                  <label className="form-label">Product Code:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedSlot.product_code}
                    onChange={(e) =>
                      setSelectedSlot({ ...selectedSlot, product_code: e.target.value })
                    }
                  />
                </div>
                {/* Description */}
                <div className="mb-2">
                  <label className="form-label">Description:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedSlot.description}
                    onChange={(e) =>
                      setSelectedSlot({ ...selectedSlot, description: e.target.value })
                    }
                  />
                </div>
                {/* Quantity */}
                <div className="mb-2">
                  <label className="form-label">Quantity:</label>
                  <input
                    type="number"
                    className="form-control"
                    value={selectedSlot.quantity}
                    onChange={(e) =>
                      setSelectedSlot({ ...selectedSlot, quantity: e.target.value })
                    }
                  />
                </div>
                {/* Unit Weight */}
                <div className="mb-2">
                  <label className="form-label">Unit Weight:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedSlot.unit_weight_gram}
                    onChange={(e) =>
                      setSelectedSlot({ ...selectedSlot, unit_weight_gram: e.target.value })
                    }
                  />
                </div>
                {/* Standard */}
                <div className="mb-2">
                  <label className="form-label">Standard:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedSlot.standard}
                    onChange={(e) =>
                      setSelectedSlot({ ...selectedSlot, standard: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedSlot(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={async () => {
                    // Call the API here
                    await handleSave(selectedSlot);
                    setSelectedSlot(null);
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

export default AutoShelves;
