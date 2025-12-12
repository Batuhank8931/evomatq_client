import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../assets/img/Logo.png";

function SideBar({ logout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const userRole = localStorage.getItem("userRole");
  const userName = localStorage.getItem("userName");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const items = [
    { label: "DashBoard", path: "/" },
    { label: "AutoShelves", path: "/autoshelves" },
    { label: "DigitalLabels", path: "/digitallabels" },
    { label: "AutoSMDStorages", path: "/autosmdstorages" },
    { label: "IndustrialVendingMachine", path: "/industrialvendingmachine" },
    { label: "AutoCarouselStorages", path: "/autocarouselstorages" },
    { label: "MailSettings", path: "/mailsettings" },
    { label: "UserSettings", path: "/usersettings" },
    { label: "Requests", path: "/requestslist" },
  ];

  // Calculate a dynamic height per button (based on viewport and item count)
  const buttonHeight = `${60 / items.length}vh`; // 60vh = total button area, adjustable

  return (
    <div
      className="d-flex flex-column text-white p-3"
      style={{
        width: "250px",          // ✅ fixed sidebar width
        minWidth: "250px",       // ✅ prevent shrinking
        height: "100vh",
        backgroundColor: "#002B5B",
        overflow: "hidden",      // keep things tidy
        flexShrink: 0,           // ✅ important in flex layouts
      }}
    >

      {/* Logo */}
      <div className="bg-white d-flex justify-content-center align-items-center rounded-3 mb-3">
        <img src={Logo} alt="EvomatQ Logo" className="my-2" style={{ width: "80%" }} />
      </div>

      {/* Menu */}
      {userRole === "Admin" && (
        <ul
          className="nav flex-column flex-grow-1 d-flex justify-content-start align-items-stretch"
          style={{ flexWrap: "nowrap" }}
        >
          {items.map((item) => {
            const active = location.pathname === item.path;
            return (
              <li className="nav-item" key={item.label} style={{ flex: `1 1 ${buttonHeight}` }}>
                <button
                  className="btn w-100 text-start"
                  style={{
                    height: buttonHeight,
                    backgroundColor: active ? "#FDC500" : "transparent",
                    color: active ? "#002B5B" : "#ffffff",
                    fontWeight: active ? "bold" : "normal",
                    fontSize: "0.9rem",
                    transition: "all 0.2s ease",
                    whiteSpace: "normal", // ✅ allow wrapping
                  }}
                  onClick={() => navigate(item.path)}
                >
                  {item.label.replace(/([A-Z])/g, " $1").trim()}
                </button>

              </li>
            );
          })}
        </ul>
      )}
      {userRole !== "Admin" && (() => {
        const active = location.pathname === "/requestslist";

        return (
          <ul className="nav flex-column">
            <li className="nav-item mb-2">
              <button
                className="btn w-100 text-start"
                style={{
                  backgroundColor: active ? "#FDC500" : "transparent",
                  color: active ? "#002B5B" : "#ffffff",
                  fontWeight: active ? "bold" : "normal",
                }}
                onClick={() => navigate("/requestslist")}
              >
                Requests
              </button>
            </li>
          </ul>
        );
      })()}


      {/* Footer / Logout */}
      <div className="mt-auto pb-2">
        {userRole && (
          <div className="text-center pb-2" style={{ color: "#FDC500", fontWeight: "bold" }}>
            <hr className="bg-light p-0 m-1" />
            {userRole}
            <hr className="bg-light  p-0 m-1" />
            {userName}
            <hr className="bg-light  p-0 m-1" />
          </div>
        )}

        {/* Logout */}
        <button className="btn btn-danger w-100 mb-2" onClick={handleLogout}>
          Logout
        </button>

        {/* Network URL */}
        <div className="text-center" style={{ fontSize: "0.8rem", color: "#FDC500" }}>
          ➜ Network: {window.location.origin}/
        </div>
      </div>
    </div>
  );
}

export default SideBar;
