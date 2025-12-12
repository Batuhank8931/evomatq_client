import React, { useState, useEffect } from "react";
import API from "../utils/utilRequest";
import "bootstrap/dist/css/bootstrap.min.css";

function UserSettings() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    user_name: "",
    email: "",
    password: "",
    user_role: "",
  });
  const [visiblePasswords, setVisiblePasswords] = useState({});

  // Fetch all users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await API.get_password_settings(); // GET /users
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching user settings:", error);
    }
  };

  // DELETE user
  const deleteUser = async (user_id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    try {
      await API.delete_user(user_id); // DELETE /deleteuser/:id
      alert("User deleted successfully!");
      setUsers((prev) => prev.filter((u) => u.user_id !== user_id)); // remove from UI
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user.");
    }
  };

  // Add a new user
  const handleAddUser = async () => {
    if (!newUser.user_name || !newUser.email || !newUser.password || !newUser.user_role) {
      alert("Please fill all fields before adding a user.");
      return;
    }

    try {
      const response = await API.add_new_user(newUser);
      alert("User added successfully!");
      setUsers((prev) => [...prev, response.data.newUser]);
      setNewUser({ user_name: "", email: "", password: "", user_role: "viewer" });
    } catch (error) {
      console.error("Error adding user:", error);
      alert("Failed to add new user.");
    }
  };

  // Save all user changes
  const handleSaveAll = async () => {
    const confirmSave = window.confirm("Are you sure you want to save all users?");
    if (!confirmSave) return;

    try {
      await API.update_password_settings(users);
      alert("User settings updated successfully!");
    } catch (error) {
      console.error("Error updating users:", error);
      alert("Failed to update users.");
    }
  };

  const handleChange = (id, key, value) => {
    setUsers((prev) =>
      prev.map((u) => (u.user_id === id ? { ...u, [key]: value } : u))
    );
  };

  const togglePassword = (id) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="container py-5">
      <h1 className="fw-bold mb-4" style={{ color: "#002B5B" }}>
        User Settings
      </h1>

      {/* Users Table */}
      <table className="table table-bordered align-middle">
        <thead className="table-light">
          <tr>
            <th style={{ width: "60px" }}>ID</th>
            <th>User Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Password</th>
            <th style={{ width: "100px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.user_id}>
              <td>{user.user_id}</td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  value={user.user_name}
                  onChange={(e) => handleChange(user.user_id, "user_name", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="email"
                  className="form-control"
                  value={user.email || ""}
                  onChange={(e) => handleChange(user.user_id, "email", e.target.value)}
                />
              </td>
              <td>
                <select
                  className="form-select"
                  value={user.user_role}
                  onChange={(e) => handleChange(user.user_id, "user_role", e.target.value)}
                >
                  <option value="admin">Admin</option>
                  <option value="Requester">Requester</option>
                  <option value="Reviewer">Reviewer</option>
                </select>
              </td>
              <td>
                <div className="input-group">
                  <input
                    type={visiblePasswords[user.user_id] ? "text" : "password"}
                    className="form-control"
                    value={user.password || ""}
                    onChange={(e) => handleChange(user.user_id, "password", e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => togglePassword(user.user_id)}
                  >
                    <i
                      className={`bi ${
                        visiblePasswords[user.user_id] ? "bi-eye-slash" : "bi-eye"
                      }`}
                    ></i>
                  </button>
                </div>
              </td>
              <td>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteUser(user.user_id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add new user */}
      <div className="card p-3 my-4 shadow-sm">
        <h5 className="mb-3">Add New User</h5>
        <div className="row g-3">
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="User Name"
              value={newUser.user_name}
              onChange={(e) => setNewUser({ ...newUser, user_name: e.target.value })}
            />
          </div>
          <div className="col-md-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
          </div>
          <div className="col-md-2">
            <select
              className="form-select"
              value={newUser.user_role}
              onChange={(e) => setNewUser({ ...newUser, user_role: e.target.value })}
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="Requester">Requester</option>
              <option value="Reviewer">Reviewer</option>
            </select>
          </div>
          <div className="col-md-3">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
          </div>
          <div className="col-md-1">
            <button className="btn btn-primary w-100" onClick={handleAddUser}>
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="d-flex justify-content-end mt-4">
        <button className="btn btn-success px-4" onClick={handleSaveAll}>
          Save All Changes
        </button>
      </div>
    </div>
  );
}

export default UserSettings;
