import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" },
  { key: "users", label: "Users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
  { key: "notifications", label: "Notifications", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
  { key: "request", label: "Request", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { key: "certificates", label: "Issued Certificates", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { key: "profile", label: "Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

export default function AdminHeader({ currentTab, onTabChange, userEmail, pendingRequestsCount = 0 }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-slate-900 via-violet-900/30 to-slate-900 border-b-4 border-violet-600 rounded-b-2xl shadow-2xl overflow-hidden"
    >
      <div className="w-full max-w-6xl mx-auto px-6">
        {/* Top row: Title, email, Logout */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 pt-6 pb-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-violet-500/30 border border-violet-400/50 shrink-0">
              <svg className="h-8 w-8 text-violet-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Admin
              </h1>
              {userEmail && (
                <p className="text-slate-400 text-sm mt-0.5">{userEmail}</p>
              )}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 transition rounded-xl text-white font-semibold shadow-lg shrink-0"
          >
            Logout
          </motion.button>
        </div>

        {/* Nav */}
        <nav className="border-t border-white/10">
          <div className="flex items-center gap-1 overflow-x-auto py-2 -mb-px scrollbar-hide">
            {navItems.map((item) => {
              const isActive = currentTab === item.key;
              return (
                <motion.button
                  key={item.key}
                  type="button"
                  onClick={() => onTabChange(item.key)}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition rounded-lg border ${
                    isActive
                      ? "text-violet-300 bg-violet-500/20 border-violet-400/30"
                      : "text-slate-400 border-transparent hover:text-white hover:bg-white/5"
                  }`}
                >
                  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  {item.label}
                  {item.key === "request" && pendingRequestsCount > 0 && (
                    <span className="ml-1 min-w-[20px] rounded-full bg-rose-500 px-1.5 py-0.5 text-xs font-bold text-white">
                      {pendingRequestsCount > 99 ? "99+" : pendingRequestsCount}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </nav>
      </div>
    </motion.header>
  );
}
