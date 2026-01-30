import React, { useEffect, useState } from "react";
import CertificateCard from "../components/Certificate";
import ProfileBanner from "../components/ProfileBanner";
import { jwtDecode } from "jwt-decode";

export default function StudentDashboard() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;

  const fetchCertificates = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/certificates/student",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

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

  if (loading) return <div className="p-10 text-white">Loading…</div>;
  if (error) return <div className="p-10 text-red-500">{error}</div>;

  return (
    <>
      {/* Banner (JWT-based) */}
      <ProfileBanner
        title={user.name || "User"}
        subtitle={`${decoded?.email || "Student"}`}
        logoUrl={null}
        role="STUDENT"
      />

      {/* Main Content */}
      <div className="bg-gray-900 min-h-screen flex justify-center">
        <div className="w-full max-w-6xl px-8 py-10">

          <h3 className="text-3xl font-semibold text-white mb-8">
            Certificates
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {certificates.length === 0 ? (
              <p className="text-gray-400">No certificates found</p>
            ) : (
              certificates.map(cert => (
                <CertificateCard key={cert.id} cert={cert} />
              ))
            )}
          </div>

        </div>
      </div>
    </>
  );
}
