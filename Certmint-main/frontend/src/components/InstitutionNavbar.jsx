import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/institution-dashboard" },
  { label: "Notifications", path: "/institution/notifications" },
  { label: "Issue Certificate", path: "/issue-certificate" },
  { label: "User Management", path: "/institution/users" },
  { label: "Profile", path: "/institute/setup" },
];

export default function InstitutionNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="bg-gray-800/90 border-b border-gray-700">
      <div className="w-full max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto">
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
      </div>
    </nav>
  );
}
