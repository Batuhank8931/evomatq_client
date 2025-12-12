//App.jsx

import "./App.css";
import MainPage from "./pages/mainpage";
import LoginPage from "./pages/LoginPage";
import { AuthProvider, useAuth } from "./context/AuthContext";

function AppContent() {
  const { token } = useAuth();

  return token ? <MainPage /> : <LoginPage />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
