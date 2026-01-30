import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000/api/admin";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
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

  const [tab, setTab] = useState("users"); // users | institutions | students | certificates

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

  // Guard: must be ADMIN
  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/login");
    }
  }, [navigate, user]);

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

  useEffect(() => {
    if (!user || user.role !== "ADMIN") return;

    setInstitutionDetail(null);
    setInstitutionId("");

    if (tab === "users") fetchUsers();
    if (tab === "students") fetchStudents();
    if (tab === "institutions") fetchInstitutions();
    if (tab === "certificates") fetchCertificates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, user]);

  const onSearch = () => {
    if (tab === "users") fetchUsers();
    if (tab === "students") fetchStudents();
    if (tab === "institutions") fetchInstitutions();
    if (tab === "certificates") fetchCertificates();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              navigate("/login");
            }}
            className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/15 transition"
          >
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {[
            ["users", "Users"],
            ["students", "Students"],
            ["institutions", "Institutions"],
            ["certificates", "Certificates"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-md border transition ${
                tab === key
                  ? "bg-blue-600 border-blue-500"
                  : "bg-transparent border-white/15 hover:bg-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-3 flex-wrap items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter by name / email / subject..."
            className="flex-1 min-w-[220px] bg-gray-800 border border-white/10 rounded-md px-3 py-2 outline-none"
          />

          {tab === "users" && (
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-gray-800 border border-white/10 rounded-md px-3 py-2 outline-none"
            >
              <option value="">All roles</option>
              <option value="STUDENT">STUDENT</option>
              <option value="INSTITUTION">INSTITUTION</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          )}

          {tab === "certificates" && (
            <input
              value={institutionId}
              onChange={(e) => setInstitutionId(e.target.value)}
              placeholder="institutionId (optional)"
              className="min-w-[220px] bg-gray-800 border border-white/10 rounded-md px-3 py-2 outline-none"
            />
          )}

          <button
            onClick={onSearch}
            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 transition"
          >
            Search
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-200 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {loading && <div className="text-white/80">Loading…</div>}

        {/* Tables */}
        {tab === "users" && (
          <div className="overflow-auto border border-white/10 rounded-xl">
            <table className="min-w-full text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-white/10">
                    <td className="px-4 py-3">{u.name}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{u.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "students" && (
          <div className="overflow-auto border border-white/10 rounded-xl">
            <table className="min-w-full text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Email</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-t border-white/10">
                    <td className="px-4 py-3">{s.user?.name || "-"}</td>
                    <td className="px-4 py-3">{s.user?.email || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "institutions" && (
          <>
            <div className="overflow-auto border border-white/10 rounded-xl">
              <table className="min-w-full text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left px-4 py-3">Institution</th>
                    <th className="text-left px-4 py-3">Owner Email</th>
                    <th className="text-left px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {institutions.map((i) => (
                    <tr key={i.id} className="border-t border-white/10">
                      <td className="px-4 py-3">{i.name}</td>
                      <td className="px-4 py-3">{i.user?.email || "-"}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => fetchInstitutionDetail(i.id)}
                          className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 transition"
                        >
                          View details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Drilldown */}
            {institutionDetailLoading && (
              <div className="text-white/80">Loading institution…</div>
            )}
            {institutionDetail?.institution && (
              <div className="border border-white/10 rounded-xl p-4 bg-white/5 space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-lg font-semibold">
                      {institutionDetail.institution.name}
                    </div>
                    <div className="text-white/70 text-sm">
                      {institutionDetail.institution.user?.email || ""}
                    </div>
                  </div>
                  <button
                    onClick={() => setInstitutionDetail(null)}
                    className="px-3 py-2 rounded-md bg-white/10 hover:bg-white/15 transition"
                  >
                    Close
                  </button>
                </div>

                <div className="overflow-auto border border-white/10 rounded-xl">
                  <table className="min-w-full text-sm">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="text-left px-4 py-3">Subject</th>
                        <th className="text-left px-4 py-3">Student</th>
                        <th className="text-left px-4 py-3">Issued</th>
                        <th className="text-left px-4 py-3">View</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(institutionDetail.certificates || []).map((c) => (
                        <tr key={c.id} className="border-t border-white/10">
                          <td className="px-4 py-3">{c.subject}</td>
                          <td className="px-4 py-3">
                            {c.studentName}
                            {c.studentEmail ? (
                              <div className="text-white/60 text-xs">
                                {c.studentEmail}
                              </div>
                            ) : null}
                          </td>
                          <td className="px-4 py-3">
                            {new Date(c.dateOfIssue).toLocaleDateString("en-GB")}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => window.open(`/certificate/${c.id}`, "_blank")}
                              className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 transition"
                            >
                              Certificate
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {tab === "certificates" && (
          <div className="overflow-auto border border-white/10 rounded-xl">
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
                {certificates.map((c) => (
                  <tr key={c.id} className="border-t border-white/10">
                    <td className="px-4 py-3">{c.subject}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setTab("institutions");
                          fetchInstitutionDetail(c.institutionId);
                        }}
                        className="underline text-blue-300 hover:text-blue-200"
                      >
                        {c.institutionName}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      {c.studentName}
                      {c.studentEmail ? (
                        <div className="text-white/60 text-xs">
                          {c.studentEmail}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(c.dateOfIssue).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => window.open(`/certificate/${c.id}`, "_blank")}
                        className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 transition"
                      >
                        Certificate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

