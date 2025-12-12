import React, { useState, useEffect, useRef } from "react";
import API from "../utils/utilRequest";
import Excel from "../assets/icons/excel.png";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function ViewRequest() {
  const [requests, setRequests] = useState({});
  const prevDataRef = useRef([]);

  const confirmAction = (message, action) => {
    if (window.confirm(message)) {
      action();
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await API.get_active_requests();
      const newData = response.data;

      // Only update state if data is different
      if (JSON.stringify(prevDataRef.current) !== JSON.stringify(newData)) {

        const grouped = newData.reduce((acc, item) => {
          if (!acc[item.adding_number]) acc[item.adding_number] = [];
          acc[item.adding_number].push(item);
          return acc;
        }, {});

        setRequests(grouped);

        prevDataRef.current = newData;
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  useEffect(() => {
    fetchRequests(); // fetch immediately on mount

    const intervalId = setInterval(fetchRequests, 3000); // fetch every 3 seconds
    return () => clearInterval(intervalId); // cleanup on unmount
  }, []);


  // ITEM LEVEL ACTIONS
  const handleItemPrepare = async (requestId, productCode, id) => {
    confirmAction("Are you sure you want to mark this item as Preparing?", async () => {
      try {
        await API.update_request_item(requestId, productCode, id, { status: "Preparing" });
        fetchRequests();
      } catch (error) {
        console.error(error);
      }
    });
  };


  const handleItemDelete = async (requestId, productCode, id) => {
    confirmAction("Are you sure you want to cancel this item?", async () => {
      try {
        await API.update_request_item(requestId, productCode, id, { status: "Cancelled" });
        fetchRequests();
      } catch (error) {
        console.error(error);
      }
    });
  };


  const handleItemReady = async (requestId, productCode, id) => {
    confirmAction("Are you sure you want to mark this item as Ready?", async () => {
      try {
        await API.update_request_item(requestId, productCode, id, { status: "Ready" });
        fetchRequests();
      } catch (error) {
        console.error(error);
      }
    });
  };


  // REQUEST LEVEL ACTIONS
  const handleDelete = async (requestId) => {
    if (!window.confirm("Are you sure you want to cancel this request?")) return;
    try {
      await API.update_request(requestId, { status: "Cancelled" });
      fetchRequests();
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAsReady = async (requestId) => {
    if (!window.confirm("Mark this entire request as Completed?")) return;
    try {
      await API.update_request(requestId, { status: "Ready" });
      fetchRequests();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container-fluid py-5" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-4 fw-bold" style={{ color: "#002B5B" }}>Active Requests</h1>
        </div>

        <div className="row g-3">
          {Object.entries(requests)
            .slice()
            .reverse()
            .map(([requestNumber, items]) => (
              <div key={requestNumber} className="col-12 mb-3">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h6 className="card-title text-primary fw-bold small mb-3">
                      Request #{requestNumber}
                    </h6>

                    <div className="row fw-bold small bg-light py-2 border-bottom text-center">
                      <div className="col-2">Product Code</div>
                      <div className="col-2">Quantity</div>
                      <div className="col-2">Status</div>
                      <div className="col-3">Request Time</div> {/* Yeni kolon */}
                      <div className="col-3">Actions</div>
                    </div>

                    {items.map((item, idx) => (
                      <div key={idx} className="row small py-2 border-bottom align-items-center text-center">
                        <div className="col-2">{item.productCode}</div>
                        <div className="col-2">{item.requestedQuantity}</div>
                        <div className="col-2">
                          <span
                            className={`badge ${item.status === "Pending" ? "bg-warning text-dark" :
                              item.status === "Preparing" ? "bg-primary" :
                                item.status === "Ready" ? "bg-success" :
                                  item.status === "Cancelled" ? "bg-danger" : "bg-secondary"
                              }`}
                          >
                            {item.status}
                          </span>
                        </div>

                        <div className="col-3">
                          {item.updated_at} {/* Tarihi gösteriyoruz */}
                        </div>

                        <div className="col-3 d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleItemPrepare(item.adding_number, item.productCode, item.id)}
                            disabled={item.status === "Ready"} // Disable if status is Ready
                          >
                            Prepare
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleItemDelete(item.adding_number, item.productCode, item.id)}
                            disabled={item.status === "Ready"} // Disable if status is Ready
                          >
                            Cancel
                          </button>
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleItemReady(item.adding_number, item.productCode, item.id)}
                            disabled={item.status === "Ready"}
                          >
                            Ready
                          </button>
                        </div>

                      </div>
                    ))}

                    <div className="d-flex justify-content-end gap-2 mt-3">
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(requestNumber)}>Cancel Request</button>
                      <button className="btn btn-sm btn-outline-success" onClick={() => handleMarkAsReady(requestNumber)}>Complete Request</button>
                    </div>

                  </div>
                </div>
              </div>
            ))}
        </div>

      </div>
    </div>
  );
}

export default ViewRequest;
