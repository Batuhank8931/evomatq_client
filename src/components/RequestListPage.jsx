import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useMemo, useRef } from "react";
import API from "../utils/utilRequest";
import Excel from "../assets/icons/excel.png";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function RequestsList() {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [filters, setFilters] = useState({});
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [editedQuantities, setEditedQuantities] = useState({});
    const prevDataRef = useRef([]);


    const userId = localStorage.getItem("userId");

    const fetchRequests = async () => {
        try {
            const response = await API.get_requests({ userId });
            const newData = response.data;

            // Only update state if data is different
            if (JSON.stringify(prevDataRef.current) !== JSON.stringify(newData)) {
                setRequests(newData);
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



    const handleDelete = async (requestId) => {
        if (!window.confirm("Are you sure you want to delete this request?")) return;
        try {
            await API.delete_request(requestId);
            await fetchRequests();
        } catch (error) {
            console.error(error);
        }
    };

    const updateRequestQuantity = async (requestId, productCode, id, requestedQuantity) => {
        if (!window.confirm("Are you sure you want to change this requestedQuantity as requestedQuantity?")) return;
        try {
            await API.update_request_quantity(requestId, productCode, id, { requestedQuantity: requestedQuantity });
            await fetchRequests();
        } catch (error) {
            console.error(error);
        }
    };


    // ✅ Column headers
    const headers = [
        { label: "Request ID", key: "adding_number" },
        { label: "Requester", key: "user_name" },
        { label: "Reviewer", key: "selectedViewer" },
        { label: "Product Code", key: "productCode" },
        { label: "Description", key: "description" },
        { label: "Standard", key: "standard" },
        { label: "Requested Quantitiy", key: "requestedQuantity" },
        { label: "Avaliable Quantitiy", key: "availableQuantity" },
        { label: "Status", key: "status" },
        { label: "Request Time", key: "updated_at" },
        { label: "Prepare Time", key: "preparing_at" },
        { label: "Ready Time", key: "ready_at" },
        { label: "Canceled Time", key: "cancelled_at" },
        { label: "Actions", key: "actions" }

    ];

    // ✅ Sort handler
    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    // ✅ Filter change handler
    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    // ✅ Filter and sort logic
    const filteredSortedData = useMemo(() => {
        let data = [...requests];

        Object.keys(filters).forEach((key) => {
            if (filters[key]) {
                data = data.filter((item) => {
                    // item value al
                    let value = item[key] ?? "";

                    // reviewer artık string olduğu için hiçbir array check yok
                    if (key === "reviewer") {
                        value = item.selectedViewer ?? "";
                    }

                    return value.toString().toLowerCase().includes(filters[key].toLowerCase());
                });
            }
        });

        // Sorting
        if (sortConfig.key) {
            data.sort((a, b) => {
                const aValue = a[sortConfig.key] || "";
                const bValue = b[sortConfig.key] || "";
                if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
                return 0;
            });
        }

        return data;
    }, [requests, filters, sortConfig]);

    // ✅ Export to Excel
    // ✅ Export to Excel
    const exportToExcel = () => {
        if (!filteredSortedData.length) return;

        // Reverse array without mutating original
        const reversed = [...filteredSortedData].reverse();

        // Map to match your desired column order and labels
        const formatted = reversed.map(item => ({
            "Request ID": item.adding_number,
            "Requester": item.user_name,
            "Reviewer": item.selectedViewer,
            "Product Code": item.productCode,
            "Description": item.description,
            "Standard": item.standard,
            "Requested Quantitiy": item.requestedQuantity,
            "Avaliable Quantitiy": item.availableQuantity,
            "Status": item.status,
            "Request Time": item.updated_at,
            "Prepare Time": item.preparing_at,
            "Ready Time": item.ready_at,
            "Canceled Time": item.cancelled_at,
        }));

        const ws = XLSX.utils.json_to_sheet(formatted);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Requests");

        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], { type: "application/octet-stream" });
        saveAs(blob, "requests.xlsx");
    };



    // ✅ Date formatter
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const handleBack = () => {
        navigate("/");
    };

    return (
        <div className="container mt-4">
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="mb-4 fw-bold" style={{ color: "#002B5B" }}>
                        All Requests
                    </h1>
                    <div className="d-flex gap-2">
                        <button
                            className="p-0 excel-btn border-0"
                            style={{ backgroundColor: "transparent" }}
                            onClick={exportToExcel}
                        >
                            <img
                                src={Excel}
                                alt="Export to Excel"
                                style={{ width: "30px", height: "30px" }}
                            />
                        </button>
                        <button className="btn btn-secondary" onClick={handleBack}>
                            ← Back
                        </button>
                    </div>
                </div>

                <div className="table-responsive">
                    <table
                        className="table table-bordered table-sm align-middle text-center shadow-sm"
                        style={{ fontSize: "12px" }}
                    >
                        <thead>
                            {/* Header Row with Sorting */}
                            <tr>
                                {headers.map(({ label, key }) => (
                                    <th
                                        key={key}
                                        style={{
                                            backgroundColor: "#002B5B",
                                            color: "white",
                                            cursor: "pointer",
                                        }}
                                        onClick={() => handleSort(key)}
                                    >
                                        {label}{" "}
                                        {sortConfig.key === key &&
                                            (sortConfig.direction === "asc" ? "▲" : "▼")}
                                    </th>
                                ))}
                            </tr>

                            {/* Filter Row */}
                            <tr>
                                {headers.map(({ key }) => (
                                    <th key={key}>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm text-center"
                                            placeholder="Search..."
                                            value={filters[key] || ""}
                                            onChange={(e) =>
                                                handleFilterChange(key, e.target.value)
                                            }
                                            style={{ fontSize: "0.75rem" }}
                                        />
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {filteredSortedData.length === 0 ? (
                                <tr>
                                    <td colSpan={headers.length} className="text-muted">
                                        No matching records found.
                                    </td>
                                </tr>
                            ) : (
                                [...filteredSortedData].reverse().map((item, idx) => (
                                    <tr key={idx} className="small">
                                        <td>{item.adding_number}</td>
                                        <td>{item.user_name}</td>
                                        <td>{item.selectedViewer}</td>
                                        <td>{item.productCode}</td>
                                        <td>{item.description}</td>
                                        <td>{item.standard}</td>
                                        <td>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm text-center"
                                                value={
                                                    editedQuantities[item.id] !== undefined
                                                        ? editedQuantities[item.id]
                                                        : item.requestedQuantity
                                                }
                                                disabled={item.status !== "Pending"}
                                                onChange={(e) =>
                                                    setEditedQuantities((prev) => ({
                                                        ...prev,
                                                        [item.id]: e.target.value,
                                                    }))
                                                }
                                                style={{
                                                    width: "80px",
                                                    margin: "auto",
                                                    fontSize: "12px",
                                                    borderColor:
                                                        item.status === "Pending" &&
                                                            Number(editedQuantities[item.id] ?? item.requestedQuantity) >
                                                            Number(item.availableQuantity)
                                                            ? "red"
                                                            : undefined,
                                                    borderWidth:
                                                        item.status === "Pending" &&
                                                            Number(editedQuantities[item.id] ?? item.requestedQuantity) >
                                                            Number(item.availableQuantity)
                                                            ? "5px"
                                                            : undefined,
                                                }}

                                            />
                                        </td>
                                        <td>{item.availableQuantity}</td>

                                        <td>
                                            <span
                                                className={`badge ${item.status === "Pending"
                                                    ? "bg-warning text-dark"
                                                    : item.status === "Preparing"
                                                        ? "bg-primary"
                                                        : item.status === "Ready"
                                                            ? "bg-success"
                                                            : item.status === "Cancelled"
                                                                ? "bg-danger"
                                                                : "bg-secondary"
                                                    }`}
                                            >
                                                {item.status}
                                            </span>
                                        </td>
                                        <td>{(item.updated_at ?? "")}</td>
                                        <td>{(item.preparing_at ?? "")}</td>
                                        <td>{(item.ready_at ?? "")}</td>
                                        <td>{(item.cancelled_at ?? "")}</td>
                                        <td style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                                            <button
                                                className="btn btn-sm btn-warning flex-fill"
                                                style={{ fontSize: "12px", lineHeight: "1" }}
                                                disabled={item.status !== "Pending"}
                                                onClick={() =>
                                                    updateRequestQuantity(
                                                        item.adding_number,
                                                        item.productCode,
                                                        item.id,
                                                        editedQuantities[item.id] ?? item.requestedQuantity
                                                    )
                                                }
                                            >
                                                Update
                                            </button>

                                            <button
                                                className="btn btn-sm btn-danger flex-fill"
                                                style={{ fontSize: "12px", lineHeight: "1" }}
                                                disabled={item.status !== "Pending"}
                                                onClick={() => handleDelete(item.adding_number)}
                                            >
                                                Cancel
                                            </button>
                                        </td>

                                    </tr>
                                ))
                            )}
                        </tbody>


                    </table>
                </div>
            </div>
        </div>
    );
}

export default RequestsList;
