import React from "react";
import { useNavigate } from "react-router-dom";
import InstitutionHeader from "./InstitutionHeader";

export default function InstitutionNotifications() {
  const navigate = useNavigate();
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  React.useEffect(() => {
    if (!user || user.role !== "INSTITUTION") {
      navigate("/login");
    }
  }, [navigate, user]);

  if (!user || user.role !== "INSTITUTION") return null;

  return (
    <>
      <InstitutionHeader
        title={user.name || "Institution"}
        subtitle={user.email || ""}
        logoUrl={null}
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
