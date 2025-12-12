import React, { useState, useEffect } from "react";
import API from "../utils/utilRequest";

function MailSettings() {
  const [systemMail, setSystemMail] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [requestCreator, setRequestCreator] = useState("");
  const [viewerMail, setViewerMail] = useState("");
  const [lowStockMail, setLowStockMail] = useState("");
  const [preview, setPreview] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const clearMails = () => {
    setSystemMail("");
    setSmtpPassword("");
    setRequestCreator("");
    setViewerMail("");
    setLowStockMail("");
    setPreview("");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await API.get_mail_settings(); // GET from API
        const emaildata = response.data[0];
        setSystemMail(emaildata.systemMail);
        setSmtpPassword(emaildata.smtpPassword);
        setRequestCreator(emaildata.requestCreator);
        setViewerMail(emaildata.viewerMail);
        setLowStockMail(emaildata.systemMail);
      } catch (error) {
        console.error("Error getting data:", error);
      }
    };

    fetchData();
  }, []);

  const reviseData = async () => {
    const body = [
      {
        systemMail,
        smtpPassword,
        requestCreator,
        viewerMail,
        lowStockMail
      }
    ];

    try {
      await API.update_mail_settings(body);
      alert("Mail settings updated on server!");
    } catch (error) {
      console.error("Error updating data:", error);
      alert("Error updating mail settings!");
    }
  };

  const saveMails = () => {
    const config = { systemMail, smtpPassword, requestCreator, viewerMail, lowStockMail };
    setPreview(JSON.stringify(config, null, 2));

    const confirmSave = window.confirm("Are you sure you want to submit these changes?");
    if (!confirmSave) return;

    reviseData();
  };

  return (
    <div className="container-fluid py-5" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <div className="container">
        <h1 className="mb-4 fw-bold" style={{ color: "#002B5B" }}>Mail Settings</h1>

        <div className="mb-3">
          <label className="form-label">System Mail Address</label>
          <input
            type="email"
            className="form-control w-50"
            placeholder="picmaster@gmail.com"
            value={systemMail}
            onChange={(e) => setSystemMail(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">SMTP App Password</label>
          <div className="input-group w-50">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              placeholder="App-specific email password"
              value={smtpPassword}
              onChange={(e) => setSmtpPassword(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
            </button>
          </div>
        </div>

        <hr className="my-4 w-50" />

        <div className="mb-3 w-50">
          <label className="form-label">Low Stock Alerts</label>
          <input
            type="email"
            className="form-control"
            placeholder="purchasing@example.com"
            value={lowStockMail}
            onChange={(e) => setLowStockMail(e.target.value)}
          />
        </div>

        <div className="d-flex gap-2 mb-4">
          <button
            className="btn w-25"
            style={{ backgroundColor: "#002B5B", color: "white" }}
            onClick={saveMails}
          >
            💾 Save
          </button>
          <button className="btn btn-danger w-25" onClick={clearMails}>
            🗑️ Delete All
          </button>
        </div>
      </div>
    </div>
  );
}

export default MailSettings;
