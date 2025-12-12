//mainpage.jsx

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import SideBar from "../components/SideBar";
import DashBoard from "../components/DashBoard";
import AutoShelves from "../components/AutoShelves";
import DigitalLabels from "../components/DigitalLabels";
import AutoSMDStorages from "../components/AutoSMDStorages";
import IndustrialVendingMachine from "../components/IndustrialVendingMachine";
import AutoCarouselStorages from "../components/AutoCarouselStorages";
import MailSettings from "../components/MailSettings";
import UserSettings from "../components/UserSettings";
import RackDetail from "../components/RackDetail";
import RequestsList from "../components/RequestListPage";

import CreateRequest from "../components/CreateRequest";
import ViewRequest from "../components/ViewRequest";

// Simple 404 Component
const NotFound = () => <h1>404 NOT FOUND</h1>;

function MainPage() {
  const userRole = localStorage.getItem("userRole"); // get the role
  const { logout } = useAuth(); // get logout from auth context

  // Determine the component to render at "/"
  let HomeComponent;
  if (userRole === "Admin") {
    HomeComponent = DashBoard;
  } else if (userRole === "Requester") {
    HomeComponent = CreateRequest;
  } else if (userRole === "Reviewer") {
    HomeComponent = ViewRequest;
  } else {
    HomeComponent = NotFound;
  }

  return (
    <Router>
      <div className="d-flex" style={{ height: "100vh", overflow: "hidden" }}>
        {/* Sidebar — fixed height */}
        <SideBar logout={logout} />

        {/* Main content area — scrollable */}
        <div
          className="flex-grow-1 p-3"
          style={{
            overflowY: "auto",
            height: "100vh",
            backgroundColor: "#f8f9fa",
          }}
        >
          <Routes>
            <Route path="/" element={<HomeComponent />} />

            {userRole === "Admin" && (
              <>
                <Route path="/autoshelves" element={<AutoShelves />} />
                <Route path="/digitallabels" element={<DigitalLabels />} />
                <Route path="/autosmdstorages" element={<AutoSMDStorages />} />
                <Route path="/industrialvendingmachine" element={<IndustrialVendingMachine />} />
                <Route path="/autocarouselstorages" element={<AutoCarouselStorages />} />
                <Route path="/mailsettings" element={<MailSettings />} />
                <Route path="/usersettings" element={<UserSettings />} />
                <Route path="/rackdetail/:rackNumber" element={<RackDetail />} />
              </>
            )}

            <Route path="/requestslist" element={<RequestsList />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </Router>

  );
}

export default MainPage;


