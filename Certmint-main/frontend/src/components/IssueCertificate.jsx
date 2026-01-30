import React, { useState } from "react";
import {useEffect } from "react";
import decoded from "jwt-decode";
import CertificatePreview from "../components/CertificatePreview";

import { useNavigate } from "react-router-dom";

export default function IssueCertificate() {
  const navigate = useNavigate();
  const [institution, setInstitution] = useState(null);
  const [subject, setSubject] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchInstitution = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "http://localhost:5000/api/institution/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) return;

        const data = await res.json();
        setInstitution(data);
      } catch (err) {
        console.error("Failed to load institution", err);
      }
    };

    fetchInstitution();
  }, []);


  const issueDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/certificates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject,
          studentName,
          studentEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to issue certificate");
        return;
      }

      setSuccess("Certificate issued successfully 🎉");

      setTimeout(() => {
        navigate("/institution-dashboard");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen grid grid-cols-1 md:grid-cols-2">

      {/* LEFT: FORM (UNCHANGED DESIGN) */}
      <div className="flex items-center justify-center px-5">
        <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow px-12 py-14 space-y-5">

          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Issue Certificate
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Generate and issue a new certificate
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md px-3 py-2">
              {success}
            </p>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="input-field"
              placeholder="Certificate Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />

            <input
              className="input-field"
              placeholder="Student Name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
            />

            <input
              className="input-field"
              placeholder="Student Email (optional)"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
            />

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 disabled:opacity-60"
              >
                {loading ? "Issuing..." : "Issue Certificate"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT: CERTIFICATE PREVIEW */}
      <CertificatePreview
        institution={institution}
        studentName={studentName}
        subject={subject}
        issueDate={issueDate}
      />
    </section>
  );
}
