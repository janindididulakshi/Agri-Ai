import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import AppShell from "./components/AppShell.jsx";
import InstallPrompt from "./components/InstallPrompt.jsx";
import NotificationPanel from "./components/NotificationPanel.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Chat from "./pages/Chat.jsx";
import Market from "./pages/Market.jsx";
import Reports from "./pages/Reports.jsx";
import Profile from "./pages/Profile.jsx";
import Predict from "./pages/Predict.jsx";

function PrivateShell() {
  return (
    <NotificationProvider>
      <InstallPrompt />
      <AppShell />
      <NotificationPanel />
    </NotificationProvider>
  );
}

function RequireAuth({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="gov-page sf-muted">පූරණය…</div>;
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/app" element={<RequireAuth><PrivateShell /></RequireAuth>}>
        <Route index element={<Dashboard />} />
        <Route path="chat" element={<Chat />} />
        <Route path="market" element={<Market />} />
        <Route path="reports" element={<Reports />} />
        <Route path="profile" element={<Profile />} />
        <Route path="predict" element={<Predict />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
