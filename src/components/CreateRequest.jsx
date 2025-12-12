import React, { useState, useEffect, useRef } from "react";
import API from "../utils/utilRequest";
import Select from "react-select";


function CreateRequest() {
    const [productCode, setProductCode] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [requestList, setRequestList] = useState([]);
    const [productInfo, setProductInfo] = useState(null); // can be string or object
    const [showModal, setShowModal] = useState(false);
    const [createdRequestId, setCreatedRequestId] = useState(null);
    const [description, setDescription] = useState("");
    const [standard, setStandard] = useState("");
    const [requests, setRequests] = useState({});

    const userId = localStorage.getItem("userId"); // get the role

    const handleCheckboxChange = (product) => {
        setRequests((prev) => ({
            ...prev,
            [product.product_code]: {
                ...prev[product.product_code],
                selected: !prev[product.product_code]?.selected, // toggle selection
                description: product.description,
                standard: product.standard,
                availableQty: product.quantity,
            },
        }));
    };


    const handleQuantityChange = (productCode, value, availableQty) => {
        const numericValue = parseInt(value, 10) || 0;

        if (numericValue > availableQty) {
            alert("Requested quantity exceeds available quantity!");
            return;
        }

        setRequests((prev) => ({
            ...prev,
            [productCode]: {
                ...prev[productCode],
                requestedQty: numericValue,
            },
        }));
    };

    // Add selected products from requests to requestList
    const addToList = () => {
        if (!requests || Object.keys(requests).length === 0) return;

        // Check if any requested quantity exceeds available quantity
        for (const [code, info] of Object.entries(requests)) {
            if (info.selected && info.requestedQty > info.availableQty) {
                alert(`Requested quantity for ${info.description} exceeds available quantity!`);
                return; // Stop execution if any product exceeds
            }
        }

        const selectedProducts = Object.entries(requests)
            .filter(([code, info]) => info.selected && info.requestedQty > 0)
            .map(([code, info]) => ({
                productCode: code,
                requestedQuantity: info.requestedQty,
                ...info, // include description, standard, availableQty, etc.
            }));

        if (selectedProducts.length === 0) return;

        setRequestList([...requestList, ...selectedProducts]);

        // Optional: reset selected products in requests
        const resetRequests = { ...requests };
        setRequests(resetRequests);
    };



    const submitAllRequests = async () => {
        // ❗ Önce requestList içinde kontrol yap
        const invalidItem = requestList.find(
            item => Number(item.requestedQuantity) > Number(item.availableQty)
        );

        if (invalidItem) {
            alert("Requested quantity exceeds available quantity!");
            return; // burada durduruyoruz
        }

        // Eğer hepsi geçerli ise devam
        await submitrequests(requestList);

    };


    const removeItem = (index) => {
        setRequestList((prev) => prev.filter((_, i) => i !== index));
    };


    // Input değiştiğinde productInfo çekme
    const handleInputChange = async (e, field) => {
        const value = e.target.value;

        switch (field) {
            case "productCode":
                setProductCode(value);
                break;
            case "description":
                setDescription(value);
                break;
            case "standard":
                setStandard(value);
                break;
            default:
                break;
        }

        if (value.trim() === "") {
            setProductInfo([]);
            return;
        }

        await fetchProductDetail({
            product_code: field === "productCode" ? value : productCode,
            product_description: field === "description" ? value : description,
            product_standard: field === "standard" ? value : standard,
        });
    };

    const fetchProductDetail = async (body) => {
        try {
            const response = await API.product_detail(body);

            if (response.status === 202) {
                setProductInfo(response.data.message);
            } else if (Array.isArray(response.data) && response.data.length > 0) {
                const formatted = response.data.map(item => ({
                    product_code: item.product_code,
                    quantity: item.quantity,
                    description: item.description,
                    standard: item.standard,
                    id: item.id
                }));

                setProductInfo(formatted);
            }
        } catch (error) {
            console.error("Error fetching product details:", error);
            setProductInfo([]);
        }
    };

    useEffect(() => {
        const interval = setInterval(async () => {
            if (!productCode && !description && !standard) return;

            const body = {
                product_code: productCode,
                product_description: description,
                product_standard: standard,
            };

            try {
                const response = await API.product_detail(body);
                if (!Array.isArray(response.data) || response.data.length === 0) return;

                const newData = response.data.map(item => ({
                    id: item.id,
                    product_code: item.product_code,
                    description: item.description,
                    standard: item.standard,
                    quantity: item.quantity
                }));

                setProductInfo(newData);

                // ⭐ TÜM GÜNCELLEMELER TEK YERDE
                setRequests(prev => {
                    const updated = { ...prev };

                    // 1) requests içindeki qty güncelle
                    newData.forEach(item => {
                        if (updated[item.product_code]) {
                            updated[item.product_code].availableQty = item.quantity;
                        }
                    });

                    // 2) requestList'i buradan güncelle (artık updated %100 güncel!)
                    setRequestList(prevList =>
                        prevList.map(row => {
                            const r = updated[row.productCode];
                            if (!r) return row;
                            return { ...row, availableQty: r.availableQty };
                        })
                    );

                    return updated;
                });

            } catch (error) {
                console.error("Error checking quantity:", error);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [productCode, description, standard]);



    const submitrequests = async (input) => {
        const requestBody = {
            input,
            userId
        };

        try {
            const response = await API.post_requests(requestBody);

            if (response.status === 201) {
                const reqId = response.data.request_id;
                setCreatedRequestId(reqId);
                setShowModal(true);
            }
            setRequestList([]);

        } catch (error) {
            console.error("Error submitting requests:", error);

            // ❗ Backend 400 mesajını göster
            if (error.response && error.response.status === 400) {
                alert(error.response.data.message || "Requested quantity exceeds available quantity!");
            } else {
                alert("An unexpected error occurred.");
            }
        }
    };


    return (
        <div className="container-fluid py-5" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
            <div className="container">
                <h1 className="mb-4 fw-bold" style={{ color: "#002B5B" }}>Create Request</h1>
                <div className="d-flex w-100">
                    <div className="w-30">

                        {/* Product Code */}
                        <div className="mb-3 w-100 d-flex flex-row">
                            <label className="form-label w-75 mt-1">Product Code</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter product code"
                                value={productCode}
                                onChange={(e) => handleInputChange(e, "productCode")}
                            />
                        </div>

                        {/* Description */}
                        <div className="mb-3 w-100 d-flex flex-row">
                            <label className="form-label w-75 mt-1">Description</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter description"
                                value={description}
                                onChange={(e) => handleInputChange(e, "description")}
                            />
                        </div>

                        {/* Standard */}
                        <div className="mb-3 w-100 d-flex flex-row">
                            <label className="form-label w-75 mt-1">Standard</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter standard"
                                value={standard}
                                onChange={(e) => handleInputChange(e, "standard")}
                            />
                        </div>
                        <button
                            className="btn w-100 mb-3"
                            style={{ backgroundColor: "#002B5B", color: "white" }}
                            onClick={addToList}
                        >
                            ➕ Add to List
                        </button>


                        <button
                            className="btn btn-success w-100 mb-3 "
                            onClick={submitAllRequests}
                        >
                            📤 Submit All Requests
                        </button>
                    </div>


                    {/* Dynamic List View Panel */}
                    <div className="w-70">
                        {productInfo && (
                            <div
                                className="m-0 ms-5 border rounded overflow-auto bg-white"
                                style={{ maxHeight: "250px" }}
                            >
                                {Array.isArray(productInfo) ? (
                                    <table className="table table-sm table-bordered table-hover mb-0" style={{ borderCollapse: "separate" }}>

                                        <thead className="table-light">
                                            <tr>
                                                <th style={{ position: "sticky", top: 0, background: "#002B5B", color: "white", zIndex: 1 }}>
                                                    Select
                                                </th>
                                                <th style={{ position: "sticky", top: 0, background: "#002B5B", color: "white", zIndex: 1 }}>
                                                    Product Code
                                                </th>
                                                <th style={{ position: "sticky", top: 0, background: "#002B5B", color: "white", zIndex: 1 }}>
                                                    Description
                                                </th>
                                                <th style={{ position: "sticky", top: 0, background: "#002B5B", color: "white", zIndex: 1 }}>
                                                    Standard
                                                </th>
                                                <th style={{ position: "sticky", top: 0, background: "#002B5B", color: "white", zIndex: 1 }}>
                                                    Available Qty
                                                </th>
                                                <th style={{ position: "sticky", top: 0, background: "#002B5B", color: "white", zIndex: 1 }}>
                                                    Requested Qty
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {productInfo.map((p, i) => (
                                                <tr key={i}>
                                                    <td style={{ textAlign: "center" }}>
                                                        <input
                                                            type="checkbox"
                                                            className="big-checkbox"
                                                            checked={requests[p.product_code]?.selected || false}
                                                            onChange={() => handleCheckboxChange(p)}
                                                        />
                                                    </td>

                                                    <td>{p.product_code}</td>
                                                    <td>{p.description}</td>
                                                    <td>{p.standard}</td>
                                                    <td>{p.quantity}</td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={requests[p.product_code]?.requestedQty || ""}
                                                            onChange={(e) =>
                                                                handleQuantityChange(
                                                                    p.product_code,
                                                                    e.target.value,
                                                                    p.quantity
                                                                )
                                                            }
                                                            disabled={!requests[p.product_code]?.selected}
                                                            className="form-control form-control-sm"
                                                            style={{
                                                                width: "80px",
                                                                backgroundColor:
                                                                    requests[p.product_code]?.requestedQty > p.quantity
                                                                        ? "red"
                                                                        : "white" // normal durumda beyaz
                                                            }}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="text-muted">No products available.</div>
                                )}
                            </div>
                        )}
                    </div>


                </div>




                <div className="d-flex gap-2 mb-4 flex-column">


                    {requestList.length > 0 && (
                        <div className="w-100">
                            <h5 className="mb-3 fw-bold text-primary">📋 Request List</h5>
                            <div className="table-responsive shadow-sm rounded">
                                <table className="table table-bordered align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>#</th>
                                            <th>Product Code</th>
                                            <th>Description</th>
                                            <th>Standard</th>
                                            <th>Available Qty</th>
                                            <th>Requested Qty</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {requestList.map((item, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.productCode}</td>
                                                <td>{item.description}</td>
                                                <td>{item.standard}</td>
                                                <td>{item.availableQty}</td>
                                                <td
                                                    style={{
                                                        backgroundColor:
                                                            item.requestedQuantity > item.availableQty ? "red" : "transparent",
                                                        color: item.requestedQuantity > item.availableQty ? "white" : "inherit",
                                                        fontWeight: item.requestedQuantity > item.availableQty ? "bold" : "normal",
                                                    }}
                                                >
                                                    {item.requestedQuantity}
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => removeItem(index)}
                                                    >
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>

                                </table>
                            </div>
                        </div>
                    )}

                </div>

            </div>
            {
                showModal && (
                    <div
                        className="modal fade show"
                        style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
                    >
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">

                                <div className="modal-header">
                                    <h5 className="modal-title">Request Submitted</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowModal(false)}
                                    ></button>
                                </div>

                                <div className="modal-body">
                                    <p className="fw-bold">
                                        Your request was successfully created.
                                    </p>
                                    <p>
                                        <strong>Request ID:</strong> {createdRequestId}
                                    </p>
                                </div>

                                <div className="modal-footer">
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        OK
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

        </div >
    );
}

export default CreateRequest;
