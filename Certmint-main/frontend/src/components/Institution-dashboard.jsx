import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CertificateCard from "./Certificate.js";
import InstitutionHeader from "./InstitutionHeader.jsx";
import { jwtDecode } from "jwt-decode";
import { motion } from "framer-motion";

// Stat card with icon
function StatCard({ icon, label, value, accent = "blue", delay = 0 }) {
  const accents = {
    blue: "from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400",
    emerald: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400",
    amber: "from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-400",
  };
  const c = accents[accent] || accents.blue;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className={`rounded-2xl border bg-gradient-to-br ${c} p-6 shadow-lg backdrop-blur-sm transition hover:shadow-xl`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="mt-2 text-3xl font-bold text-white tabular-nums">{value}</p>
        </div>
        <div className="rounded-xl bg-white/10 p-3">
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

export default function InstitutionDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [certificates, setCertificates] = useState([]);

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const t = localStorage.getItem("token");
      const res = await fetch(
        "http://localhost:5000/api/institutions?includeMonthly=true",
        {
          headers: { Authorization: `Bearer ${t}`, Accept: "application/json" },
        }
      );
      const json = await res.json();
      if (!res.ok) {
        setError(json.message || "Failed to load dashboard");
        return;
      }
      setData(json);
    } catch (err) {
      console.error(err);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCertificates = async () => {
    try {
      const t = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/certificates", {
        headers: { Authorization: `Bearer ${t}`, Accept: "application/json" },
      });
      const json = await res.json();
      if (res.ok) setCertificates(json.certificates || []);
    } catch (err) {
      console.error("Certificate fetch error:", err);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchCertificates();
  }, []);

  const thisMonthCount = data?.monthlyIssuance?.length
    ? (data.monthlyIssuance[data.monthlyIssuance.length - 1]?.count ?? 0)
    : 0;
  const totalCerts = data?.stats?.totalCertificates ?? certificates.length;
  const uniqueStudents = data?.stats?.totalUniqueStudents ?? 0;

  if (loading) {
    return (
      <>
        <InstitutionHeader title="..." subtitle={user?.email} logoUrl={null} />
        <div className="bg-gray-900 min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <InstitutionHeader title="Institution" subtitle={user?.email} logoUrl={null} />
        <div className="bg-gray-900 min-h-screen flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full rounded-2xl border border-red-500/30 bg-gray-800/80 p-8 text-center shadow-xl"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20 text-red-400">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Something went wrong</h3>
            <p className="mt-2 text-gray-400">{error}</p>
            <button
              onClick={() => { setError(""); fetchDashboard(); }}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
            >
              Try again
            </button>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <InstitutionHeader
        title={data.institution.name}
        subtitle={user?.email}
        logoUrl={data.institution.logoUrl}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950"
      >
        <div className="mx-auto max-w-6xl px-6 py-8 sm:px-8 sm:py-10">
          {/* Welcome card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-blue-600/20 via-indigo-500/10 to-transparent p-6 shadow-xl sm:p-8"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                  Welcome back{data.institution?.name ? `, ${data.institution.name}` : ""}
                </h1>
                <p className="mt-1 text-gray-400">
                  Here’s an overview of your certificates and activity.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/issue-certificate")}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg transition hover:bg-blue-700"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Issue new certificate
              </motion.button>
            </div>
          </motion.div>

          {/* Stat cards */}
          <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <StatCard
              delay={0.1}
              accent="blue"
              label="Total certificates"
              value={totalCerts}
              icon={
                <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            />
            <StatCard
              delay={0.2}
              accent="emerald"
              label="Unique students"
              value={uniqueStudents}
              icon={
                <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
            />
            <StatCard
              delay={0.3}
              accent="amber"
              label="This month"
              value={thisMonthCount}
              icon={
                <svg className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
          </div>

          {/* Certificates section card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl border border-white/10 bg-gray-800/40 p-6 shadow-xl backdrop-blur sm:p-8"
          >
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold text-white sm:text-2xl">
                Recent certificates
              </h2>
              <button
                onClick={() => navigate("/issue-certificate")}
                className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
              >
                View all & issue new →
              </button>
            </div>

            {certificates.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-600 py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-700/50">
                  <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-400">No certificates issued yet</p>
                <p className="mt-1 text-sm text-gray-500">Issue your first certificate to get started</p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/issue-certificate")}
                  className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
                >
                  Issue certificate
                </motion.button>
              </div>
            ) : (
              <div
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                style={{ gridAutoRows: "minmax(0, 1fr)" }}
              >
                {certificates.map((cert, i) => (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                    whileHover={{ y: -4 }}
                    className="transition-shadow"
                  >
                    <CertificateCard cert={cert} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
