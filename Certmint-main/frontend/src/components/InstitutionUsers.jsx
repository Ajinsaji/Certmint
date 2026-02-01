import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import InstitutionHeader from "./InstitutionHeader";

export default function InstitutionUsers() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "INSTITUTION") {
      navigate("/login");
      return;
    }
    const fetchCerts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/certificates", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (res.ok) setCertificates(json.certificates || []);
      } catch {
        setCertificates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, [navigate, user, token]);

  if (!user || user.role !== "INSTITUTION") return null;

  const uniqueStudents = Array.from(
    new Map(
      certificates
        .filter((c) => c.studentNameSnapshot || c.studentEmailSnapshot)
        .map((c) => [
          c.studentEmailSnapshot || c.studentNameSnapshot,
          { name: c.studentNameSnapshot, email: c.studentEmailSnapshot || "—" },
        ])
    ).values()
  );

  return (
    <>
      <InstitutionHeader
        title={user.name || "Institution"}
        subtitle={user.email || ""}
        logoUrl={null}
      />
      <div className="bg-gray-900 min-h-screen px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-white mb-6">User Management</h2>
          <p className="text-gray-400 text-sm mb-6">
            Students who have received certificates from your institution.
          </p>
          {loading ? (
            <p className="text-gray-400">Loading…</p>
          ) : uniqueStudents.length === 0 ? (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
              <p className="text-gray-400">No students have received certificates yet.</p>
            </div>
          ) : (
            <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-200 font-medium">Student Name</th>
                    <th className="text-left px-4 py-3 text-gray-200 font-medium">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {uniqueStudents.map((s, i) => (
                    <tr key={i} className="border-t border-gray-700">
                      <td className="px-4 py-3 text-white">{s.name}</td>
                      <td className="px-4 py-3 text-gray-300">{s.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
