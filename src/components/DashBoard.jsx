import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../utils/utilRequest";

import AutoShelfImg from "../assets/img/AutoShelf.png";
import EinkImg from "../assets/img/eink.png";
import CarouselImg from "../assets/img/carousel.png";
import SmdImg from "../assets/img/smd.png";
import VendingImg from "../assets/img/vending.png";

// Map string names to imported images
const imageMap = {
  AutoShelfImg: AutoShelfImg,
  EinkImg: EinkImg,
  CarouselImg: CarouselImg,
  SmdImg: SmdImg,
  VendingImg: VendingImg,
};


function DashBoard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [dashboarddata, setDashboarData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await API.dashboard_data();
        setDashboarData(response.data);

      } catch (error) {
        console.error("Error getting data:", error);
      }
    };

    fetchData();
  }, []);


  return (
    <div className="container my-4">
      <div
        className="row 
                row-cols-2
                row-cols-sm-3
                row-cols-md-4
                row-cols-lg-5
                g-4"
      >
        {dashboarddata.map((item) => (
          <div key={item.id} className="col">
            <div className="card shadow rounded-4 text-center p-3 h-100 d-flex flex-column">
              <img
                src={imageMap[item.img]} // use the mapping here
                alt={item.title}
                className="img-fluid mx-auto mb-3 d-block"
                style={{ maxHeight: "80px", objectFit: "contain" }}
              />

              <h5 className="fw-bold">{item.title}</h5>

              <p
                className="flex-grow-1 text-muted"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {item.description}
              </p>

              <span
                className="mx-5 text-xs badge mb-3"
                style={{
                  backgroundColor: item.status === "ONLINE" ? "#d4edda" : "#f8d7da",
                  color: item.status === "ONLINE" ? "#155724" : "#721c24",
                  fontSize: "0.6rem"
                }}
              >
                {item.status}
              </span>

              <button
                className="btn btn-primary mt-auto mx-5"
                style={{ backgroundColor: "#002B5B", fontSize: "0.75rem" }}
                onClick={() => navigate(item.path)}
              >
                {item.buttonLabel}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashBoard;
