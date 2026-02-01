import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AdminHeader from "./AdminHeader";

const API_BASE = "http://localhost:5000/api/admin";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

// Stat card for dashboard
function StatCard({ label, value, icon, accent, delay = 0 }) {
  const colors = {
    violet: "from-violet-500/20 to-violet-600/5 border-violet-500/30",
    blue: "from-blue-500/20 to-blue-600/5 border-blue-500/30",
    emerald: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30",
    amber: "from-amber-500/20 to-amber-600/5 border-amber-500/30",
    rose: "from-rose-500/20 to-rose-600/5 border-rose-500/30",
  };
  const c = colors[accent] || colors.violet;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`rounded-2xl border bg-gradient-to-br ${c} p-6 shadow-xl backdrop-blur-sm transition-shadow hover:shadow-2xl`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-white/70">{label}</p>
          <p className="mt-2 text-3xl font-bold text-white tabular-nums">{value}</p>
        </div>
        <div className="rounded-xl bg-white/10 p-3">{icon}</div>
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const [tab, setTab] = useState("dashboard"); // dashboard | users | notifications | request | certificates | profile
  const [userView, setUserView] = useState("all"); // all | students | institutions (sub-view for Users tab)

  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [institutionId, setInstitutionId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [certificates, setCertificates] = useState([]);

  const [institutionDetail, setInstitutionDetail] = useState(null);
  const [institutionDetailLoading, setInstitutionDetailLoading] = useState(false);

  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [approveResult, setApproveResult] = useState(null);

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Guard: must be ADMIN
  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/login");
    }
  }, [navigate, user]);

  // Dark background for admin page (override body light theme)
  useEffect(() => {
    const prev = document.body.style.background;
    const prevColor = document.body.style.color;
    document.body.style.background = "#0f172a"; /* slate-900 */
    document.body.style.color = "#f8fafc";
    return () => {
      document.body.style.background = prev;
      document.body.style.color = prevColor;
    };
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (role) params.set("role", role);
      const res = await fetch(`${API_BASE}/users?${params.toString()}`, {
        headers: authHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to load users");
      setUsers(json.users || []);
    } catch (e) {
      setError(e.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      const res = await fetch(`${API_BASE}/students?${params.toString()}`, {
        headers: authHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to load students");
      setStudents(json.students || []);
    } catch (e) {
      setError(e.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  const fetchInstitutions = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      const res = await fetch(`${API_BASE}/institutions?${params.toString()}`, {
        headers: authHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to load institutions");
      setInstitutions(json.institutions || []);
    } catch (e) {
      setError(e.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCertificates = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (institutionId) params.set("institutionId", institutionId);
      const res = await fetch(`${API_BASE}/certificates?${params.toString()}`, {
        headers: authHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to load certificates");
      setCertificates(json.certificates || []);
    } catch (e) {
      setError(e.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingInstitutions = async () => {
    setPendingLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/pending-institutions`, {
        headers: authHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to load requests");
      const list = json.requests || [];
      setPendingRequests(list);
      setStats((prev) => (prev ? { ...prev, pendingRequests: list.length } : prev));
    } catch (e) {
      setError(e.message || "Server error");
    } finally {
      setPendingLoading(false);
    }
  };

  const handleApproveRequest = async (id) => {
    setError("");
    try {
      const res = await fetch(`${API_BASE}/pending-institutions/${id}/approve`, {
        method: "POST",
        headers: authHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Approve failed");
      setApproveResult({
        institutionName: json.user?.name,
        email: json.user?.email,
        passwordSameAsEmail: json.passwordSameAsEmail === true,
        temporaryPassword: json.temporaryPassword,
      });
      await fetchPendingInstitutions();
      await fetchStats();
    } catch (e) {
      setError(e.message || "Server error");
    }
  };

  const handleBanUser = async (userId) => {
    setError("");
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/ban`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Ban failed");
      if (institutionDetail?.institution?.user?.id === userId) {
        setInstitutionDetail((prev) =>
          prev?.institution?.user
            ? {
                ...prev,
                institution: {
                  ...prev.institution,
                  user: { ...prev.institution.user, banned: true },
                },
              }
            : prev
        );
      }
    } catch (e) {
      setError(e.message || "Server error");
    }
  };

  const handleUnbanUser = async (userId) => {
    setError("");
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/unban`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Unban failed");
      if (institutionDetail?.institution?.user?.id === userId) {
        setInstitutionDetail((prev) =>
          prev?.institution?.user
            ? {
                ...prev,
                institution: {
                  ...prev.institution,
                  user: { ...prev.institution.user, banned: false },
                },
              }
            : prev
        );
      }
    } catch (e) {
      setError(e.message || "Server error");
    }
  };

  const handleRejectRequest = async (id) => {
    setError("");
    try {
      const res = await fetch(`${API_BASE}/pending-institutions/${id}/reject`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Reject failed");
      await fetchPendingInstitutions();
      await fetchStats();
    } catch (e) {
      setError(e.message || "Server error");
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/stats`, { headers: authHeaders() });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to load stats");
      setStats(json);
    } catch (e) {
      setError(e.message || "Server error");
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchInstitutionDetail = async (id) => {
    setInstitutionDetailLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (q) params.set("certQ", q);
      const res = await fetch(
        `${API_BASE}/institutions/${id}?${params.toString()}`,
        { headers: authHeaders() }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to load institution");
      setInstitutionDetail(json);
    } catch (e) {
      setError(e.message || "Server error");
    } finally {
      setInstitutionDetailLoading(false);
    }
  };

  // Fetch stats on mount for header counters (request count)
  useEffect(() => {
    if (!user || user.role !== "ADMIN") return;
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") return;

    setInstitutionDetail(null);
    setInstitutionId("");

    if (tab === "dashboard") fetchStats();
    if (tab === "users") { fetchUsers(); fetchStudents(); fetchInstitutions(); }
    if (tab === "certificates") fetchCertificates();
    if (tab === "request") fetchPendingInstitutions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, user]);

  const onSearch = () => {
    if (tab === "users") { fetchUsers(); fetchStudents(); fetchInstitutions(); }
    if (tab === "certificates") fetchCertificates();
    if (tab === "request") fetchPendingInstitutions();
  };

  const displayIsInstitutions = userView === "institutions";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
      <AdminHeader
        currentTab={tab}
        onTabChange={setTab}
        userEmail={user?.email}
        pendingRequestsCount={stats?.pendingRequests ?? 0}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto max-w-6xl px-6 py-8 sm:py-10"
      >
        {/* Filters - only for users, certificates, request */}
        {(tab === "users" || tab === "certificates") && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-white/10 bg-slate-800/40 p-4 shadow-xl backdrop-blur-sm"
          >
            <div className="flex flex-wrap items-center gap-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Filter by name / email / subject..."
                className="flex-1 min-w-[200px] rounded-xl border border-white/10 bg-slate-700/50 px-4 py-2.5 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-violet-500"
              />
              {tab === "users" && (
                <>
                  <select
                    value={userView}
                    onChange={(e) => setUserView(e.target.value)}
                    className="rounded-xl border border-white/10 bg-slate-700/50 px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-violet-500"
                  >
                    <option value="all">All users</option>
                    <option value="students">Students</option>
                    <option value="institutions">Institutions</option>
                  </select>
                  {userView === "all" && (
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="rounded-xl border border-white/10 bg-slate-700/50 px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="">All roles</option>
                      <option value="STUDENT">STUDENT</option>
                      <option value="INSTITUTION">INSTITUTION</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  )}
                </>
              )}
              {tab === "certificates" && (
                <input
                  value={institutionId}
                  onChange={(e) => setInstitutionId(e.target.value)}
                  placeholder="Institution ID (optional)"
                  className="min-w-[180px] rounded-xl border border-white/10 bg-slate-700/50 px-4 py-2.5 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-violet-500"
                />
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSearch}
                className="rounded-xl bg-violet-600 px-5 py-2.5 font-medium text-white shadow-lg hover:bg-violet-700 transition"
              >
                Search
              </motion.button>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200"
          >
            {error}
          </motion.div>
        )}

        {loading && tab === "users" && <div className="text-white/80">Loading…</div>}
        {pendingLoading && tab === "request" && <div className="text-white/80">Loading requests…</div>}
        {statsLoading && tab === "dashboard" && (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          </div>
        )}

        {/* Dashboard tab */}
        <AnimatePresence mode="wait">
          {tab === "dashboard" && stats && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/10 bg-gradient-to-r from-violet-500/20 via-slate-800/60 to-transparent p-6 shadow-xl backdrop-blur-sm sm:p-8"
              >
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  Welcome back{user?.name ? `, ${user.name}` : ""}
                </h2>
                <p className="mt-2 text-slate-400">Overview of your platform stats.</p>
              </motion.div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <StatCard
                  delay={0.05}
                  accent="violet"
                  label="Total users"
                  value={stats.users ?? 0}
                  icon={
                    <svg className="h-6 w-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  }
                />
                <StatCard
                  delay={0.1}
                  accent="blue"
                  label="Students"
                  value={stats.students ?? 0}
                  icon={
                    <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    </svg>
                  }
                />
                <StatCard
                  delay={0.15}
                  accent="emerald"
                  label="Institutions"
                  value={stats.institutions ?? 0}
                  icon={
                    <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  }
                />
                <StatCard
                  delay={0.2}
                  accent="amber"
                  label="Issued certificates"
                  value={stats.certificates ?? 0}
                  icon={
                    <svg className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  }
                />
                <StatCard
                  delay={0.25}
                  accent="rose"
                  label="Pending requests"
                  value={stats.pendingRequests ?? 0}
                  icon={
                    <svg className="h-6 w-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  }
                />
              </div>
            </motion.div>
          )}

          {tab === "notifications" && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-800/40 py-20 shadow-xl backdrop-blur-sm"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/20">
                <svg className="h-8 w-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
              <p className="mt-2 text-center text-slate-400 text-sm">No notifications at the moment.</p>
            </motion.div>
          )}

          {tab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-white/10 bg-slate-800/40 p-8 shadow-xl backdrop-blur-sm max-w-md"
            >
              <h3 className="text-xl font-semibold text-white">Profile</h3>
              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Name</p>
                  <p className="mt-1 text-white">{user?.name ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Email</p>
                  <p className="mt-1 text-white">{user?.email ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Role</p>
                  <p className="mt-1 text-violet-300 font-medium">{user?.role ?? "—"}</p>
                </div>
              </div>
            </motion.div>
          )}

          {tab === "users" && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="overflow-auto rounded-2xl border border-white/10 bg-slate-800/40 shadow-xl backdrop-blur-sm"
            >
              <table className="min-w-full text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-slate-300">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-300">Email</th>
                    {userView === "all" && <th className="text-left px-4 py-3 font-medium text-slate-300">Role</th>}
                    {displayIsInstitutions && <th className="text-left px-4 py-3 font-medium text-slate-300">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {userView === "all" && users.map((u, i) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-t border-white/10 hover:bg-white/5"
                    >
                      <td className="px-4 py-3 text-white">{u.name}</td>
                      <td className="px-4 py-3 text-slate-300">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          u.role === "ADMIN" ? "bg-violet-500/30 text-violet-300" :
                          u.role === "INSTITUTION" ? "bg-emerald-500/30 text-emerald-300" : "bg-blue-500/30 text-blue-300"
                        }`}>{u.role}</span>
                      </td>
                    </motion.tr>
                  ))}
                  {userView === "students" && students.map((s, i) => (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-t border-white/10 hover:bg-white/5"
                    >
                      <td className="px-4 py-3 text-white">{s.user?.name || "—"}</td>
                      <td className="px-4 py-3 text-slate-300">{s.user?.email || "—"}</td>
                    </motion.tr>
                  ))}
                  {displayIsInstitutions && institutions.map((i, idx) => (
                    <motion.tr
                      key={i.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="border-t border-white/10 hover:bg-white/5"
                    >
                      <td className="px-4 py-3 font-medium text-white">{i.name}</td>
                      <td className="px-4 py-3 text-slate-300">{i.user?.email || "—"}</td>
                      <td className="px-4 py-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => fetchInstitutionDetail(i.id)}
                          className="rounded-lg bg-violet-600/80 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-600 transition"
                        >
                          View details
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {tab === "users" && institutionDetailLoading && (
            <div className="text-white/80 py-4">Loading institution…</div>
          )}
          {tab === "users" && institutionDetail?.institution && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-2xl border border-white/10 bg-slate-800/40 p-6 shadow-xl backdrop-blur-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
                <div className="flex items-start gap-4">
                  {institutionDetail.institution.logoUrl ? (
                    <img
                      src={`http://localhost:5000${institutionDetail.institution.logoUrl}`}
                      alt="Logo"
                      className="h-16 w-16 rounded-xl border border-white/10 object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-xl border border-white/10 bg-slate-700/50 flex items-center justify-center text-slate-500 text-xs">
                      No logo
                    </div>
                  )}
                  <div>
                    <div className="text-xl font-semibold text-white">{institutionDetail.institution.name}</div>
                    <div className="text-slate-400 text-sm mt-0.5">{institutionDetail.institution.user?.email || "—"}</div>
                    {institutionDetail.institution.contactNumber && (
                      <div className="text-slate-400 text-sm mt-1">Phone: {institutionDetail.institution.contactNumber}</div>
                    )}
                    {institutionDetail.institution.address && (
                      <div className="text-slate-400 text-sm mt-1">Address: {institutionDetail.institution.address}</div>
                    )}
                    {institutionDetail.institution.locationUrl && (
                      <a
                        href={institutionDetail.institution.locationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-400 hover:text-violet-300 text-sm mt-1 inline-block"
                      >
                        Location link →
                      </a>
                    )}
                    {institutionDetail.institution.documentPath && (
                      <a
                        href={`http://localhost:5000${institutionDetail.institution.documentPath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm mt-1 inline-block"
                      >
                        View document {institutionDetail.institution.documentOriginalName ? `(${institutionDetail.institution.documentOriginalName})` : "→"}
                      </a>
                    )}
                    {institutionDetail.institution.createdAt && (
                      <div className="text-slate-500 text-xs mt-2">
                        Joined {new Date(institutionDetail.institution.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {institutionDetail.institution.user?.id && (
                    <>
                      {institutionDetail.institution.user.banned ? (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleUnbanUser(institutionDetail.institution.user.id)}
                          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition"
                        >
                          Unban user
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleBanUser(institutionDetail.institution.user.id)}
                          className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 transition"
                        >
                          Ban user
                        </motion.button>
                      )}
                      {institutionDetail.institution.user.banned && (
                        <span className="rounded-full bg-rose-500/30 px-2.5 py-0.5 text-xs font-medium text-rose-300">
                          Banned
                        </span>
                      )}
                    </>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setInstitutionDetail(null)}
                    className="rounded-xl bg-white/10 px-4 py-2 text-white hover:bg-white/15 transition"
                  >
                    Close
                  </motion.button>
                </div>
              </div>

              <h4 className="text-sm font-medium text-slate-400 mb-2">Issued certificates</h4>
              <div className="overflow-auto rounded-xl border border-white/10">
                <table className="min-w-full text-sm">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-slate-300">Subject</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-300">Student</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-300">Issued</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-300">View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(institutionDetail.certificates || []).map((c, i) => (
                      <motion.tr
                        key={c.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-t border-white/10 hover:bg-white/5"
                      >
                        <td className="px-4 py-3 text-white">{c.subject}</td>
                        <td className="px-4 py-3">
                          {c.studentName}
                          {c.studentEmail ? <div className="text-slate-500 text-xs">{c.studentEmail}</div> : null}
                        </td>
                        <td className="px-4 py-3 text-slate-400">{new Date(c.dateOfIssue).toLocaleDateString("en-GB")}</td>
                        <td className="px-4 py-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => window.open(`/certificate/${c.id}`, "_blank")}
                            className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700 transition"
                          >
                            Certificate
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

        {tab === "request" && (
          <motion.div
            key="request"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <p className="text-slate-400 text-sm">
                Institution signup requests. Approve to create their account; they can then log in with the temporary password you receive.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={fetchPendingInstitutions}
                disabled={pendingLoading}
                className="rounded-xl bg-violet-600/80 px-4 py-2.5 font-medium text-white hover:bg-violet-600 transition disabled:opacity-60"
              >
                Refresh
              </motion.button>
            </div>
            <div className="overflow-auto rounded-2xl border border-white/10 bg-slate-800/40 shadow-xl backdrop-blur-sm">
              <table className="min-w-full text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left px-4 py-3">Institution</th>
                    <th className="text-left px-4 py-3">Email</th>
                    <th className="text-left px-4 py-3">Phone</th>
                    <th className="text-left px-4 py-3">Address</th>
                    <th className="text-left px-4 py-3">Document</th>
                    <th className="text-left px-4 py-3">Requested</th>
                    <th className="text-left px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.length === 0 && !pendingLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-white/60">
                        No pending institution requests
                      </td>
                    </tr>
                  ) : (
                    pendingRequests.map((r) => (
                      <tr key={r.id} className="border-t border-white/10">
                        <td className="px-4 py-3 font-medium">{r.institutionName}</td>
                        <td className="px-4 py-3">{r.email}</td>
                        <td className="px-4 py-3">{r.phone || "—"}</td>
                        <td className="px-4 py-3 max-w-[180px] truncate" title={r.address}>{r.address || "—"}</td>
                        <td className="px-4 py-3">
                          {r.documentPath ? (
                            <a
                              href={`http://localhost:5000${r.documentPath}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline"
                            >
                              {r.documentOriginalName || "View"}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 text-white/70">
                          {new Date(r.createdAt).toLocaleString("en-GB")}
                        </td>
                        <td className="px-4 py-3 flex gap-2">
                          <button
                            onClick={() => handleApproveRequest(r.id)}
                            className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectRequest(r.id)}
                            className="px-3 py-1.5 rounded-md bg-red-600/80 hover:bg-red-600 transition"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {approveResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-slate-800 border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">Institution approved</h3>
                  <p className="text-white/80 text-sm mb-4">
                    <strong>{approveResult.email}</strong> can log in with their <strong>email</strong> as both email and password.
                  </p>
                  <div className="bg-gray-900 rounded-lg p-4 mb-4">
                    <p className="text-xs text-white/60 mb-1">Login</p>
                    <p className="text-white font-medium">Email: {approveResult.email}</p>
                    <p className="text-white/90 text-sm mt-1">Password: same as email</p>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setApproveResult(null)}
                      className="flex-1 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium transition"
                    >
                      Close
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}

        {tab === "certificates" && (
          <motion.div
            key="certificates"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="overflow-auto rounded-2xl border border-white/10 bg-slate-800/40 shadow-xl backdrop-blur-sm"
          >
            <table className="min-w-full text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left px-4 py-3">Subject</th>
                  <th className="text-left px-4 py-3">Institution</th>
                  <th className="text-left px-4 py-3">Student</th>
                  <th className="text-left px-4 py-3">Issued</th>
                  <th className="text-left px-4 py-3">View</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((c, i) => (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-t border-white/10 hover:bg-white/5"
                  >
                    <td className="px-4 py-3 text-white">{c.subject}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setTab("users");
                          setUserView("institutions");
                          fetchInstitutionDetail(c.institutionId);
                        }}
                        className="underline text-violet-300 hover:text-violet-200 font-medium"
                      >
                        {c.institutionName}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {c.studentName}
                      {c.studentEmail ? <div className="text-slate-500 text-xs">{c.studentEmail}</div> : null}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{new Date(c.dateOfIssue).toLocaleDateString("en-GB")}</td>
                    <td className="px-4 py-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => window.open(`/certificate/${c.id}`, "_blank")}
                        className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700 transition"
                      >
                        Certificate
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="mt-12 border-t border-white/10 py-6 text-center text-slate-500 text-sm">
          <p>Certmint Admin Dashboard</p>
          <p className="mt-1">Manage users, institution requests, and issued certificates.</p>
        </footer>
      </motion.div>
    </div>
  );
}

