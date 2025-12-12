import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Logo from "../assets/img/Logo.png";

function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const success = await login(username, password);
      if (!success) {
        setError("Incorrect username or password!");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-light">
      {/* Logo */}
      <img
        src={Logo}
        alt="EvomatQ Logo"
        className="mb-4"
        style={{ width: "350px", height: "100px" }}
      />

      {/* Login card */}
      <div
        className="card p-4 shadow rounded"
        style={{ width: "320px", borderTop: "6px solid #FDC500" }}
      >
        <h3 className="text-center mb-4 fw-bold" style={{ color: "#002B5B" }}>
          Login
        </h3>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Username field */}
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Password field */}
          <div className="mb-3">
            <label className="form-label">Password</label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i
                  className={`bi ${
                    showPassword ? "bi-eye-slash" : "bi-eye"
                  }`}
                ></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn w-100"
            style={{ backgroundColor: "#002B5B", color: "white" }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
