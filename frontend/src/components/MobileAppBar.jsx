import { Link } from "react-router-dom";
import { FiUser, FiBell } from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";
import { useNotifications } from "../context/NotificationContext.jsx";

/** Matches mobile dashboard mockup: avatar · title · bell */
export default function MobileAppBar({ title = "Agri AI" }) {
  const { user } = useAuth();
  const { toggle, unreadCount } = useNotifications();
  return (
    <header className="gov-mobile-app-bar">
      <Link to="/app/profile" className="gov-mobile-app-bar-avatar" aria-label="Account">
        {user?.photo_url ? <img src={user.photo_url} alt="" /> : <FiUser size={20} />}
      </Link>
      <div className="gov-mobile-app-bar-title">{title}</div>
      <button type="button" className="gov-mobile-app-bar-bell gov-notif-trigger" onClick={toggle} aria-label="Notifications">
        <FiBell size={20} />
        {unreadCount > 0 ? (
          <span className="gov-notif-badge" aria-hidden>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>
    </header>
  );
}
