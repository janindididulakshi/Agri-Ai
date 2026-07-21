import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FiHome, FiMessageSquare, FiShoppingCart, FiBarChart2, FiUser, FiSearch, FiBell, FiGlobe, FiLogOut, FiFeather, FiActivity } from "react-icons/fi";
import { useLang } from "../context/LanguageContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useNotifications } from "../context/NotificationContext.jsx";
import BottomNav from "./BottomNav.jsx";
import { useState } from "react";

function SidebarLink({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 24px",
        margin: "8px 16px",
        borderRadius: "12px",
        textDecoration: "none",
        color: isActive ? "#065f46" : "#64748b",
        background: isActive ? "#dcfce7" : "transparent",
        fontWeight: isActive ? 700 : 500,
        transition: "all 0.2s"
      })}
      end={to === "/app"}
    >
      {({ isActive }) => (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ color: isActive ? "#10b981" : "#94a3b8" }}>{icon}</span>
            <span>{label}</span>
          </div>
          {isActive && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} />}
        </>
      )}
    </NavLink>
  );
}

export default function AppShell() {
  const { lang, setLang } = useLang();
  const { user, logout } = useAuth();
  const { unreadCount, toggle: toggleNotifications } = useNotifications();
  const nav = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    nav("/login", { replace: true });
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "transparent", width: "100%" }}>
      <aside className="gov-sidebar" style={{ width: "260px", background: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderRight: "1px solid rgba(0, 0, 0, 0.05)", display: "flex", flexDirection: "column", flexShrink: 0, zIndex: 10 }}>
        <div style={{ padding: "32px 24px", display: "flex", alignItems: "center", gap: "12px" }}>
          <img src="/logo.jpg" alt="Govi AI" style={{ height: "40px", width: "auto", borderRadius: "8px", objectFit: "contain" }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: "16px", color: "#1e293b" }}>Govi AI</div>
            <div style={{ fontSize: "11px", color: "#94a3b8" }}>Smart farm dashboard</div>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          <SidebarLink to="/app" icon={<FiHome size={20} />} label="Home" />
          <SidebarLink to="/app/chat" icon={<FiMessageSquare size={20} />} label="Chat" />
          <SidebarLink to="/app/predict" icon={<FiActivity size={20} />} label="Crop Suggestion" />
          <SidebarLink to="/app/market" icon={<FiShoppingCart size={20} />} label="Market" />
          <SidebarLink to="/app/reports" icon={<FiBarChart2 size={20} />} label="Reports" />
          <SidebarLink to="/app/profile" icon={<FiUser size={20} />} label="Profile" />
        </nav>
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh", overflow: "hidden" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "14px 16px", background: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,0,0,0.05)", zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "999px", padding: "0 14px", height: "40px", flex: 1, minWidth: 0, gap: "10px", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
            <FiSearch size={14} color="#94a3b8" />
            <input 
              type="text" 
              name="search_dummy"
              autoComplete="off"
              placeholder="Search farm data..." 
              style={{ border: "none", outline: "none", background: "transparent", fontSize: "14px", color: "#334155", flex: 1, minHeight: 0, height: "100%", padding: 0 }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <button 
              type="button" 
              onClick={toggleNotifications}
              style={{ position: "relative", width: "40px", height: "40px", minWidth: "40px", minHeight: "40px", borderRadius: "50%", background: "#fff", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}
            >
              <FiBell size={16} color="#475569" />
              {unreadCount > 0 && (
                <div style={{ position: "absolute", top: "6px", right: "6px", width: "8px", height: "8px", background: "#ef4444", borderRadius: "50%", border: "2px solid #fff" }} />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                const langs = ["en", "si", "ta"];
                const next = langs[(langs.indexOf(lang) + 1) % langs.length];
                setLang(next);
              }}
              style={{ width: "40px", height: "40px", minWidth: "40px", minHeight: "40px", borderRadius: "50%", background: "#fff", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}
            >
              <FiGlobe size={16} color="#475569" />
            </button>

            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", width: "40px", height: "40px", minWidth: "40px", minHeight: "40px", borderRadius: "50%" }}
              >
                <img
                  src={user?.photo_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=felix"}
                  alt="User"
                  style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: "1px solid #e2e8f0", display: "block" }}
                />
              </button>

              {showUserMenu && (
                <div style={{ position: "absolute", top: "100%", right: 0, marginTop: "8px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", padding: "8px", display: "flex", flexDirection: "column", minWidth: "160px", zIndex: 100 }}>
                  <button type="button" onClick={() => { nav("/app/profile"); setShowUserMenu(false); }} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", background: "none", border: "none", textAlign: "left", cursor: "pointer", borderRadius: "8px", fontSize: "14px", color: "#334155" }}>
                    <FiUser size={16} /> Profile
                  </button>
                  <button type="button" onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", background: "none", border: "none", textAlign: "left", cursor: "pointer", borderRadius: "8px", fontSize: "14px", color: "#ef4444" }}>
                    <FiLogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          <Outlet />
        </div>
        <BottomNav />
      </div>
    </div>
  );
}
