import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import CertificateABI from "../abi/CertificateNFT.json";
import CertificatePreview from "../components/CertificatePreview";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const CONTRACT_ADDRESS = "0x560F59d11712BacF6F9B44db863db123F331D4eA";
const SEPOLIA_RPC =
  "https://eth-sepolia.g.alchemy.com/v2/gm1tQdRrm-OjaEoZh4iSk";

export default function VerifyCertificate() {
  const { tokenId } = useParams();
  const [status, setStatus] = useState("loading");
  const [data, setData] = useState(null);
  const [institution, setInstitution] = useState(null);

  const certRef = useRef(null);

  useEffect(() => {
    async function verify() {
      try {
        const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CertificateABI.abi,
          provider
        );

        const isValid = await contract.isValid(tokenId);
        if (!isValid) {
          setStatus("revoked");
          return;
        }

        const [, issuer, uri] = await contract.getCertificate(tokenId);
        const base64 = uri.split(",")[1];
        const decoded = JSON.parse(atob(base64));

        const merged = { issuer, ...decoded };
        setData(merged);

        // If metadata contains certificateId, fetch institution details from backend
        // so the verify page can show the same institution name/logo as the issued certificate.
        if (decoded?.certificateId) {
          try {
            const certRes = await fetch(
              `http://localhost:5000/api/certificates/${decoded.certificateId}`
            );
            if (certRes.ok) {
              const cert = await certRes.json();

              // Prefer the backend snapshot name (stable) if present
              merged.institutionName =
                cert.institutionName || merged.institutionName;
              setData({ ...merged });

              if (cert.institutionId) {
                const instRes = await fetch(
                  `http://localhost:5000/api/institution/${cert.institutionId}`
                );
                if (instRes.ok) {
                  const inst = await instRes.json();
                  setInstitution(inst);
                } else {
                  setInstitution(null);
                }
              }
            }
          } catch (e) {
            console.error("Verify page backend fetch failed:", e);
          }
        }

        setStatus("valid");
      } catch (err) {
        console.error(err);
        setStatus("invalid");
      }
    }

    verify();
  }, [tokenId]);

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

    pdf.addImage(imgData, "PNG", 0, 0);
    pdf.save(`${data.studentName}-${data.subject}.pdf`);
  };

  const copyVerifyLink = async () => {
    const url = `${window.location.origin}/verify/${tokenId}`;
    await navigator.clipboard.writeText(url);
    alert("Verify link copied 🔗");
  };

  // ---- UI STATES ----

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Verifying certificate on blockchain…
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-400 text-xl">
        ❌ Invalid Certificate
      </div>
    );
  }

  if (status === "revoked") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-yellow-400 text-xl">
        ⚠️ Certificate Revoked
      </div>
    );
  }

  // ---- SUCCESS ----

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-6 px-4">

      <h1 className="text-green-400 text-2xl font-semibold">
        ✅ Certificate Verified on Blockchain
      </h1>

      <CertificatePreview
        ref={certRef}
        institution={institution}
        institutionName={data.institutionName}
        studentName={data.studentName}
        subject={data.subject}
        issueDate={data.issuedAt}
      />

      <div className="flex gap-4 flex-wrap justify-center">
        <button
          onClick={downloadPDF}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
        >
          Download PDF
        </button>

        <button
          onClick={copyVerifyLink}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold"
        >
          Copy Verify Link
        </button>
      </div>

      <p className="text-gray-400 text-sm mt-2">
        Token ID: {tokenId} · Issuer: {data.issuer}
      </p>
    </div>
  );
}
