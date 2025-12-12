import React, { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import API from "../utils/utilRequest";

const fields = [
    { name: "id", label: "ID", type: "text", required: true },
    { name: "rack", label: "Rack", type: "number", required: true },
    { name: "level", label: "Level", type: "number", required: true },
    { name: "box_width_mm", label: "Box Width (mm)", type: "number" },
    { name: "product_code", label: "Product Code", type: "text" },
    { name: "description", label: "Description", type: "text" },
    { name: "standard", label: "Standard", type: "text" },
    { name: "quantity", label: "Quantity", type: "number" },
    { name: "unit_weight_gram", label: "Unit Weight (g)", type: "number" },
    { name: "total_weight_kg", label: "Total Weight (kg)", type: "number" },
    { name: "status", label: "Status", type: "select", options: ["full", "medium", "empty"] },
    { name: "color", label: "Color", type: "color" },
    { name: "rfid", label: "RFID", type: "text" },
];

function AddItemModal({ show, handleClose, handleAdd }) {
    const initialFormData = fields.reduce((acc, f) => ({ ...acc, [f.name]: "" }), {});
    const [formData, setFormData] = useState(initialFormData);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const item = {
            ...formData,
            rack: Number(formData.rack),
            level: Number(formData.level),
            box_width_mm: Number(formData.box_width_mm),
            quantity: Number(formData.quantity),
            unit_weight_gram: Number(formData.unit_weight_gram),
            total_weight_kg: Number(formData.total_weight_kg),
        };
        handleAdd(item);
        try {
            await API.create_rack(item);
        } catch (err) {
            console.error(err);
        }
        setFormData(initialFormData);
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose} size="md" centered>
            <Modal.Header closeButton className="py-1">
                <Modal.Title className="text-xs">Add New Item</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body className="p-2">
                    {fields.map((field) => (
                        <Row className="mb-1 align-items-center text-xs" key={field.name}>
                            <Col xs={4} className="d-flex align-items-center">
                                <Form.Label className="mb-0 text-xs">{field.label}</Form.Label>
                            </Col>
                            <Col xs={8}>
                                {field.name === "color" ? (
                                    <div className="d-flex gap-2">
                                        <Form.Control
                                            size="sm"
                                            type="color"
                                            name={field.name}
                                            value={formData[field.name]}
                                            onChange={handleChange}
                                            className="text-xs py-0"
                                        />
                                        <Form.Control
                                            size="sm"
                                            type="text"
                                            name={field.name}
                                            value={formData[field.name]}
                                            onChange={handleChange}
                                            placeholder="#rrggbb"
                                            className="text-xs py-0"
                                        />
                                    </div>
                                ) : field.type === "select" ? (
                                    <Form.Select
                                        size="sm"
                                        name={field.name}
                                        value={formData[field.name]}
                                        onChange={handleChange}
                                        className="text-xs py-0"
                                    >
                                        <option value="">Select {field.label}</option>
                                        {field.options.map((opt) => (
                                            <option key={opt} value={opt}>
                                                {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                            </option>
                                        ))}
                                    </Form.Select>
                                ) : (
                                    <Form.Control
                                        size="sm"
                                        type={field.type}
                                        name={field.name}
                                        value={formData[field.name]}
                                        onChange={handleChange}
                                        required={field.required || false}
                                        className="text-xs py-0"
                                    />
                                )}
                            </Col>
                        </Row>
                    ))}
                </Modal.Body>
                <Modal.Footer className="py-1">
                    <Button variant="secondary" size="sm" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" size="sm" type="submit">
                        Add Item
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );

}

export default AddItemModal;
