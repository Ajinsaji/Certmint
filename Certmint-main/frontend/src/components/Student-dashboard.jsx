import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CertificateCard from "../components/Certificate";
import ProfileBanner from "../components/ProfileBanner";
import { jwtDecode } from "jwt-decode";

export default function StudentDashboard() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;

  const fetchCertificates = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/certificates/student", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.message || "Failed to load certificates");
        return;
      }
      setCertificates(json.certificates || []);
    } catch (err) {
      console.error(err);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  if (loading) {
    return (
      <>
        <ProfileBanner
          title={user?.name || "User"}
          subtitle={decoded?.email || user?.email || "Student"}
          logoUrl={null}
          role="STUDENT"
        />
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <p className="text-slate-400">Loading your certificates…</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <ProfileBanner
          title={user?.name || "User"}
          subtitle={decoded?.email || user?.email || "Student"}
          logoUrl={null}
          role="STUDENT"
        />
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full rounded-2xl border border-red-500/30 bg-slate-800/80 p-8 text-center shadow-xl backdrop-blur-sm"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20 text-red-400">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Something went wrong</h3>
            <p className="mt-2 text-slate-400">{error}</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => fetchCertificates()}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 transition"
            >
              Try again
            </motion.button>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <ProfileBanner
        title={user?.name || "User"}
        subtitle={decoded?.email || user?.email || "Student"}
        logoUrl={null}
        role="STUDENT"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950"
      >
        <div className="mx-auto max-w-6xl px-6 py-8 sm:py-10">
          {/* Welcome card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-blue-600/20 via-indigo-500/10 to-transparent p-6 shadow-xl backdrop-blur-sm sm:p-8"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                  Welcome back{user?.name ? `, ${user.name}` : ""}
                </h1>
                <p className="mt-1 text-slate-400">
                  Here’s an overview of your certificates and activity.
                </p>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex shrink-0 items-center gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                  <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white tabular-nums">{certificates.length}</p>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Certificates</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Certificates section */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="rounded-2xl border border-white/10 bg-slate-800/40 p-6 shadow-xl backdrop-blur-sm sm:p-8"
          >
            <h2 className="mb-6 text-xl font-semibold text-white sm:text-2xl">
              Your certificates
            </h2>

            {certificates.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-600 py-16 text-center"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-700/50">
                  <svg className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-slate-400">No certificates yet</p>
                <p className="mt-1 text-sm text-slate-500">
                  Certificates issued to you by institutions will appear here.
                </p>
              </motion.div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {certificates.map((cert, i) => (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.3 }}
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
