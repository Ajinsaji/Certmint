import React, { useState } from "react";
import { useEffect } from "react";
import CertificatePreview from "../components/CertificatePreview";
import InstitutionHeader from "../components/InstitutionHeader";
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
  const [issueMode, setIssueMode] = useState("quick"); // "quick" | "manual"
  const [timePeriod, setTimePeriod] = useState("");
  const [extraContent, setExtraContent] = useState("");

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
          certificateTemplate: "classic",
          ...(issueMode === "manual" && (timePeriod || extraContent) && {
            timePeriod: timePeriod.trim() || undefined,
            extraContent: extraContent.trim() || undefined,
          }),
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

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  return (
    <section className="relative bg-gray-50 dark:bg-gray-900 min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="col-span-full">
        <InstitutionHeader
          title={institution?.name || user?.name || "Institution"}
          subtitle={user?.email || ""}
          logoUrl={institution?.logoUrl}
        />
      </div>

      {/* LEFT: Back + FORM */}
      <div className="flex flex-col items-center justify-start px-5 py-6">
        <button
          type="button"
          onClick={() => navigate("/institution-dashboard")}
          className="self-start inline-flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 px-3 py-2 rounded-lg transition shadow-sm mb-4"
          aria-label="Back to dashboard"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm font-medium">Back to dashboard</span>
        </button>
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

          {/* Mode: Quick issue vs Manual content */}
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 p-1 bg-gray-100 dark:bg-gray-700">
            <button
              type="button"
              onClick={() => setIssueMode("quick")}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition ${
                issueMode === "quick"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Quick issue
            </button>
            <button
              type="button"
              onClick={() => setIssueMode("manual")}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition ${
                issueMode === "manual"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Manual content
            </button>
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
            {issueMode === "quick" ? (
              <>
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
              </>
            ) : (
              <>
                <input
                  className="input-field"
                  placeholder="Name on certificate"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                />
                <input
                  className="input-field"
                  placeholder="Course / Achievement"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
                <input
                  className="input-field"
                  placeholder="Time period (optional) e.g. Jan 2024 - Jun 2024"
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                />
                <input
                  className="input-field"
                  placeholder="Additional content (optional) e.g. duration, location"
                  value={extraContent}
                  onChange={(e) => setExtraContent(e.target.value)}
                />
              </>
            )}

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
        timePeriod={timePeriod}
        extraContent={extraContent}
      />
    </section>
  );
}
