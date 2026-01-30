import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CertificateCard from "./Certificate.js";
import ProfileBanner from "./ProfileBanner.js";
import { jwtDecode } from "jwt-decode";



export default function InstitutionDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      const decoded = token ? jwtDecode(token) : null;


  const [certificates, setCertificates] = useState([]);

  

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      const decoded = token ? jwtDecode(token) : null;

      const res = await fetch(
        "http://localhost:5000/api/institutions?includeMonthly=true",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
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
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5000/api/certificates",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const json = await res.json();

      if (!res.ok) {
        console.error(json.message || "Failed to load certificates");
        return;
      }

      setCertificates(json.certificates || []);
    } catch (err) {
      console.error("Certificate fetch error:", err);
    }
  };


  useEffect(() => {
    fetchDashboard();
    fetchCertificates();
  }, []);

  if (loading) return <pre>Loading...</pre>;
  if (error) return <pre style={{ color: "red" }}>{error}</pre>;

  return (
    // profile
    <>
      <ProfileBanner
        title={data.institution.name}
        logoUrl={data.institution.logoUrl}
        subtitle={user.email}
        buttonText="Issue Certificate"
        buttonLink="/issue-certificate"
        role="INSTITUTION"
      />


      {/* Main Content */}
      <div className="bg-gray-900 min-h-screen flex justify-center">
        <div className="w-full max-w-6xl px-8 py-10">

          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-semibold text-white">
              Certificates
            </h3>

            <button
              onClick={() => navigate("/issue-certificate")}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium shadow"
            >
              Issue New
            </button>
          </div>

          {/* Certificate List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {certificates.length === 0 ? (
              <p className="text-gray-400">
                No certificates issued yet
              </p>
            ) : (
              certificates.map(cert => (
                <CertificateCard
                  key={cert.id}
                  cert={cert}
                />
              ))
            )}
          </div>

        </div>
      </div>
  </>
  );
}
