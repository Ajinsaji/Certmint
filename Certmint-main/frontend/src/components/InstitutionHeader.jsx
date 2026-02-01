import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/institution-dashboard" },
  { label: "Notifications", path: "/institution/notifications" },
  { label: "Issue Certificate", path: "/issue-certificate" },
  { label: "User Management", path: "/institution/users" },
  { label: "Profile", path: "/institute/setup" },
];

export default function InstitutionHeader({ title, subtitle, logoUrl }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b-4 border-blue-700 rounded-b-lg shadow-xl">
      <div className="w-full max-w-6xl mx-auto px-6">
        {/* Top row: Logo, name/email, Logout */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 pt-6 pb-4">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full border-2 border-blue-500 overflow-hidden bg-gray-700 flex items-center justify-center shrink-0">
              {logoUrl && logoUrl !== "undefined" && logoUrl !== "null" ? (
                <img
                  src={`http://localhost:5000${logoUrl}`}
                  alt="Institution Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-xs text-center px-2">No Logo</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-blue-400 tracking-wide">
                {title || "Institution"}
              </h1>
              {subtitle && (
                <p className="text-gray-300 text-sm mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 transition rounded-md text-white font-semibold shadow-lg shrink-0"
          >
            Logout
          </button>
        </div>

        {/* Nav: Dashboard, Notifications, Issue Certificate, User Management, Profile */}
        <nav className="border-t border-gray-700/80">
          <div className="flex items-center gap-1 overflow-x-auto pt-1 -mb-px">
            {navItems.map(({ label, path }) => {
              const isActive =
                location.pathname === path ||
                (path === "/institution-dashboard" && location.pathname === "/institution-dashboard") ||
                (path !== "/institution-dashboard" && location.pathname.startsWith(path));
              return (
                <button
                  key={path}
                  type="button"
                  onClick={() => navigate(path)}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition border-b-2 ${
                    isActive
                      ? "text-blue-400 border-blue-500 bg-gray-700/50"
                      : "text-gray-300 border-transparent hover:text-white hover:bg-gray-700/30"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
