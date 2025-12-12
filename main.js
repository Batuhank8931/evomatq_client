const express = require("express");
const path = require("path");
const os = require("os");
const Bonjour = require("bonjour");
const { exec } = require("child_process");
const fs = require("fs");
const { app: electronApp } = require("electron");

const PORT = 5173;

// ----------------------------------------
// Get local IP
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "127.0.0.1";
}
const LOCAL_IP = getLocalIP();

// ----------------------------------------
// Writable config path (always works in Electron)
const configPath = path.join(electronApp.getPath("userData"), "config.json");

// Read or create config
let configContent = { API_HOST: LOCAL_IP, API_PORT: PORT };
try {
  if (fs.existsSync(configPath)) {
    configContent = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  }
} catch (err) {
  console.warn("Config okunamadı, yeni oluşturuluyor:", err);
}

// Update IP/PORT
configContent.API_HOST = LOCAL_IP;
configContent.API_PORT = 3008;

fs.writeFileSync(configPath, JSON.stringify(configContent, null, 2), "utf-8");
console.log(`✅ config.json güncellendi: ${configPath}`);

// ----------------------------------------
// Express app
const app = express();

// Serve config.json dynamically (must come BEFORE static)
app.get("/config.json", (req, res) => {
  try {
    const data = fs.readFileSync(configPath, "utf-8");
    res.type("application/json").send(data);
  } catch {
    res.status(404).json({ error: "Config not found" });
  }
});

// Serve static files after
app.use(express.static(path.join(__dirname, "dist")));

// SPA fallback
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  const url = `http://${LOCAL_IP}:${PORT}`;
  console.log(`🌍 Server running at ${url}`);

  const bonjour = Bonjour();
  bonjour.publish({ name: "EvomatQ", type: "http", port: PORT });

  const startCmd =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
      ? "start"
      : "xdg-open";

  exec(`${startCmd} ${url}`, (err) => {
    if (err) console.error("Tarayıcı açılamadı:", err);
  });
});
