import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InstitutionHeader from "./InstitutionHeader";

export default function InstitutionNotifications() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const [logoUrl, setLogoUrl] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "INSTITUTION") {
      navigate("/login");
      return;
    }
    const fetchInstitution = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/institution/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setLogoUrl(data.logoUrl || null);
        }
      } catch {
        // keep logoUrl null
      }
    };
    fetchInstitution();
  }, [navigate, user, token]);

  if (!user || user.role !== "INSTITUTION") return null;

  return (
    <>
      <InstitutionHeader
        title={user.name || "Institution"}
        subtitle={user.email || ""}
        logoUrl={logoUrl}
      />
      <div className="bg-gray-900 min-h-screen flex justify-center items-center px-6">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Notifications</h2>
          <p className="text-gray-400 text-sm">
            Institution notifications will appear here. You can see certificate activity and alerts.
          </p>
        </div>
      </div>
    </>
  );
}
