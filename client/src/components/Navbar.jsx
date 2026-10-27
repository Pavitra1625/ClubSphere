import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, CalendarDays, CheckCheck, LogOut, PlusCircle, UserRound } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const notificationRef = useRef(null);
  const loadNotifications = useCallback(async () => {
    if (!user) return;
    try { const { data } = await api.get("/notifications"); setNotifications(data.notifications || []); setUnreadCount(data.unreadCount || 0); setNotificationError(""); }
    catch { setNotificationError("Could not load notifications."); }
  }, [user]);
  useEffect(() => {
    if (!user) { setNotifications([]); setUnreadCount(0); return undefined; }
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    const refresh = () => loadNotifications();
    window.addEventListener("notifications-updated", refresh);
    return () => { clearInterval(interval); window.removeEventListener("notifications-updated", refresh); };
  }, [user, loadNotifications]);
  useEffect(() => {
    if (!showNotifications) return undefined;
    function handleOutsidePointerDown(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    function handleEscape(event) {
      if (event.key === "Escape") setShowNotifications(false);
    }
    document.addEventListener("pointerdown", handleOutsidePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showNotifications]);
  async function markAsRead(id) {
    try { await api.patch(`/notifications/${id}/read`); await loadNotifications(); } catch { setNotificationError("Could not update notification."); }
  }
  async function markAllAsRead() {
    try { await api.patch("/notifications/read-all"); await loadNotifications(); } catch { setNotificationError("Could not update notifications."); }
  }
  async function handleLogout() { try { await logout(); } finally { navigate("/login", { replace: true }); } }
  return <header className="navbar">
    <Link to="/" className="brand"><span className="brand-mark"><CalendarDays size={21}/></span><span>Club<span className="brand-accent">Sphere</span></span></Link>
    <nav className="nav-links"><NavLink to="/">Explore events</NavLink>{user?.role === "student" && <NavLink to="/student">Student dashboard</NavLink>}{user?.role === "organizer" && <NavLink to="/organizer">Organizer dashboard</NavLink>}{user?.role === "admin" && <NavLink to="/admin">Admin dashboard</NavLink>}</nav>
    <div className="nav-actions">
      {user ? <><div className="notification-wrapper" ref={notificationRef}><button className="icon-button notification-button" onClick={() => { setShowNotifications(v => !v); if (!showNotifications) loadNotifications(); }} aria-label="Notifications" title="Notifications"><Bell size={18}/>{unreadCount > 0 && <span className="notification-count">{unreadCount > 99 ? "99+" : unreadCount}</span>}</button>{showNotifications && <div className="notification-dropdown"><div className="notification-header"><strong>Notifications</strong>{unreadCount > 0 && <button className="notification-mark-all" onClick={markAllAsRead}><CheckCheck size={14}/> Mark all read</button>}</div>{notificationError && <div className="notification-error">{notificationError}</div>}<div className="notification-list">{notifications.length ? notifications.map(n => <button key={n._id} className={`notification-item ${n.read ? "" : "unread"}`} onClick={() => !n.read && markAsRead(n._id)}><span className="notification-dot">{n.read ? "○" : "●"}</span><span className="notification-content"><strong>{n.title}</strong><span>{n.message}</span><small>{new Date(n.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</small></span></button>) : !notificationError && <div className="notification-empty">You're all caught up.</div>}</div></div>}</div>
        <span className="user-pill"><UserRound size={15}/>{user.name.split(" ")[0]} <span className="role-tag">{user.role}</span></span>{(user.role === "organizer" || user.role === "admin") && <Link className="button button-primary button-small" to="/manage/new"><PlusCircle size={16}/> Create event</Link>}<button className="icon-button" onClick={handleLogout} title="Log out"><LogOut size={18}/></button>
      </> : <><Link className="button button-ghost button-small" to="/login">Log in</Link><Link className="button button-primary button-small" to="/register">Get started</Link></>}
    </div>
  </header>;
}
