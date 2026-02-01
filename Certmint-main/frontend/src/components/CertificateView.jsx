import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CertificatePreview from "../components/CertificatePreview";
import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function CertificateView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const goBack = () => {
    if (user?.role === "INSTITUTION") navigate("/institution-dashboard");
    else if (user?.role === "STUDENT") navigate("/student-dashboard");
    else if (user?.role === "ADMIN") navigate("/admin-dashboard");
    else navigate("/login");
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [certificate, setCertificate] = useState(null);
  const [institution, setInstitution] = useState(null);

  const certRef = useRef(null);

    const downloadPDF = async () => {
    if (!certRef.current) return;

    const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("landscape", "px", [
        canvas.width,
        canvas.height,
    ]);

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    const safeStudent = (certificate.studentName || "student")
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_]/g, "");

        const safeSubject = (certificate.subject || "certificate")
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_]/g, "");

        pdf.save(`${safeStudent}-${safeSubject}.pdf`);
    };


  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/certificates/${id}`
        );

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Certificate not found");
          return;
        }

        setCertificate(data);

        // fetch institution separately
        const instRes = await fetch(
          `http://localhost:5000/api/institution/${data.institutionId}`
        );

        if (instRes.ok) {
          const instData = await instRes.json();
          setInstitution(instData);
        }

      } catch (err) {
        console.error(err);
        setError("Server error");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [id]);

  if (loading) return <div className="p-10">Loading certificate…</div>;
  if (error) return <div className="p-10 text-red-500">{error}</div>;

  const copyVerifyLink = async () => {

  const verifyUrl = `${window.location.origin}/verify/${certificate.blockchainTokenId}`;

  try {
    await navigator.clipboard.writeText(verifyUrl);
    alert("Verify link copied 🧾"); 
  } catch (err) {
    console.error("Copy failed", err);
    alert("Failed to copy link");
  }
};


  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-6">
      <div className="w-full max-w-5xl px-4">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-2 text-white/90 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-2 rounded-lg transition"
          aria-label="Go back"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>
      <CertificatePreview
        ref={certRef}
        institution={institution}
        institutionName={certificate.institutionName}
        studentName={certificate.studentName}
        subject={certificate.subject}
        issueDate={new Date(certificate.dateOfIssue).toLocaleDateString(
          "en-GB",
          {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }
        )}
        timePeriod={certificate.timePeriod}
        extraContent={certificate.extraContent}
      />
      <div className="flex gap-4">
        <button
            onClick={downloadPDF}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow"
        >
            Download Certificate (PDF)
        </button>


            <button
            onClick={copyVerifyLink}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg shadow"
            >
            Copy Verify Link
            </button>

        </div>
    </div>
  );
}
