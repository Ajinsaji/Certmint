import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

export default function ProfileBanner({
  title,
  subtitle,
  logoUrl,
  role
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [openNotifications, setOpenNotifications] = useState(false);
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const fetchingUnreadRef = useRef(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login"); // change if your login route is different
  };

  const token = localStorage.getItem("token");

  const fetchUnread = async () => {
    if (!token || role !== "STUDENT" || fetchingUnreadRef.current) return;
    fetchingUnreadRef.current = true;
    try {
      const res = await fetch("http://localhost:5000/api/notifications/unread-count", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) setUnread(json.unread || 0);
    } catch {
      // ignore
    } finally {
      fetchingUnreadRef.current = false;
    }
  };

  const fetchNotifications = async () => {
    if (!token || role !== "STUDENT") return;
    try {
      const res = await fetch("http://localhost:5000/api/notifications?limit=20", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) setNotifications(json.notifications || []);
    } catch {
      // ignore
    }
  };

  const markAllRead = async () => {
    if (!token || role !== "STUDENT") return;
    try {
      await fetch("http://localhost:5000/api/notifications/mark-all-read", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } finally {
      fetchUnread();
      fetchNotifications();
    }
  };

  useEffect(() => {
    if (role !== "STUDENT") return;
    fetchUnread();
    const id = setInterval(fetchUnread, 30000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  return (
    <div className="h-[28vh] bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b-4 border-blue-700 flex items-center">
      <div className="w-full max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">

        {/* Left: Logo + Info */}
        <div className="flex items-center gap-5">
          {/* Logo */}
          {role === "INSTITUTION" && (
          <div className="w-24 h-24 rounded-full border-2 border-blue-500 overflow-hidden bg-gray-700 flex items-center justify-center">
            {logoUrl && logoUrl !== "undefined" && logoUrl !== "null" ? (
              <img
                src={`http://localhost:5000${logoUrl}`}
                alt="Institution Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400 text-sm text-center px-2">
                No Logo
              </span>
            )}
          </div>
          )}

          {/* Text */}
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-blue-400 tracking-wide">
              {title}
            </h1>

            {subtitle && (
              <p className="text-gray-300 text-sm md:text-base mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex gap-3 items-center flex-wrap justify-end">
          {/* Dashboard (Student) */}
          {role === "STUDENT" && (
            <button
              type="button"
              onClick={() => navigate("/student-dashboard")}
              className={`px-4 py-2 transition rounded-md font-semibold shadow-lg ${
                location.pathname === "/student-dashboard"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 hover:bg-gray-600 text-white"
              }`}
            >
              Dashboard
            </button>
          )}

          {/* Notifications (Student) */}
          {role === "STUDENT" && (
            <div className="relative">
              <button
                type="button"
                onClick={async () => {
                  const next = !openNotifications;
                  setOpenNotifications(next);
                  if (next) {
                    await fetchNotifications();
                    await markAllRead();
                  }
                }}
                className="relative px-4 py-2 bg-gray-700 hover:bg-gray-600 transition rounded-md text-white font-semibold shadow-lg"
                aria-label="Notifications"
              >
                <span className="inline-flex items-center gap-2">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M15 17H6a2 2 0 0 1-2-2v-1a6 6 0 1 1 12 0v1a2 2 0 0 1-2 2Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M19 17h-4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 21a2 2 0 0 0 4 0"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="hidden sm:inline">Notifications</span>
                </span>

                {unread > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </button>

              {openNotifications && (
                <div className="absolute right-0 mt-2 w-[340px] max-w-[80vw] bg-gray-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-20">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
                    <div className="text-sm font-semibold text-white">Notifications</div>
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="text-xs text-blue-300 hover:text-blue-200"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-72 overflow-auto">
                    {notifications.length === 0 ? (
                      <div className="px-3 py-4 text-sm text-white/70">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => window.open(`/certificate/${n.certificateId}`, "_blank")}
                          className="w-full text-left px-3 py-3 border-b border-white/10 hover:bg-white/5 transition"
                        >
                          <div className="text-sm font-semibold text-white">
                            {n.title}
                          </div>
                          <div className="text-xs text-white/70 mt-0.5">
                            {n.message}
                          </div>
                          <div className="text-[11px] text-white/50 mt-1">
                            {new Date(n.createdAt).toLocaleString()}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {role === "STUDENT" && (
            <button
              type="button"
              onClick={() => navigate("/student-profile")}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 transition rounded-md text-white font-semibold shadow-lg"
            >
              Profile
            </button>
          )}

          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 transition rounded-md text-white font-semibold shadow-lg"
          >
            Logout
          </button>
        </div>

      </div>
    </div>
  );
}
