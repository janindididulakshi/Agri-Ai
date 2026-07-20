import { NavLink } from "react-router-dom";
import { FiHome, FiMessageSquare, FiShoppingCart, FiBarChart2, FiUser } from "react-icons/fi";
import { useLang } from "../context/LanguageContext.jsx";

export default function BottomNav() {
  const { t } = useLang();

  const tab = (to, icon, label) => (
    <NavLink
      to={to}
      end={to === "/app"}
      className={({ isActive }) => `gov-nav-item${isActive ? " gov-nav-item--active" : ""}`}
    >
      <div className="gov-nav-icon">{icon}</div>
      <div>{label}</div>
    </NavLink>
  );

  return (
    <nav className="gov-bottom-nav" aria-label="Mobile navigation">
      {tab("/app", <FiHome size={20} />, t("home"))}
      {tab("/app/chat", <FiMessageSquare size={20} />, t("chat"))}
      {tab("/app/market", <FiShoppingCart size={20} />, t("market"))}
      {tab("/app/reports", <FiBarChart2 size={20} />, t("reports"))}
      {tab("/app/profile", <FiUser size={20} />, t("profile"))}
    </nav>
  );
}
