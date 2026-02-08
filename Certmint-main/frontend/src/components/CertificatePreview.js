import React, { forwardRef } from "react";

const CertificatePreview = forwardRef(
  (
    {
      institution,
      institutionName,
      studentName,
      subject,
      issueDate,
      timePeriod,
      extraContent,
      verifyUrl,
    },
    ref
  ) => {
    const displayInstitutionName =
      institution?.name || institutionName || "Institution Name";
    const logoUrl =
      institution?.logoUrl &&
      institution.logoUrl !== "undefined" &&
      institution.logoUrl !== "null"
        ? `http://localhost:5000${institution.logoUrl}`
        : null;

    return (
      <div
        ref={ref}
        className="flex items-center justify-center p-6 md:p-8"
        style={{
          background: "radial-gradient(ellipse at center, #1e293b 0%, #0f172a 70%)",
          boxShadow: "inset 0 0 80px rgba(0,0,0,0.4)",
        }}
      >
        <div className="drop-shadow-2xl">
          <div className="relative w-full max-w-2xl aspect-[3/2] bg-white overflow-hidden shadow-2xl">
            <div className="absolute inset-4 border-2 border-amber-700/40 rounded pointer-events-none z-10" />
            <div className="absolute inset-6 border border-amber-600/25 rounded pointer-events-none z-10" />
            <img
              src="/certificate-template.png"
              alt="Certificate"
              className="w-full h-full object-cover opacity-95"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/10 pointer-events-none" />
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
              {logoUrl && (
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-600/50 shadow-md bg-white flex items-center justify-center mb-2">
                  <img
                    src={logoUrl}
                    alt="Institution Logo"
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="text-center font-semibold tracking-[0.18em] text-amber-900/90 text-xs uppercase">
                {displayInstitutionName}
              </div>
            </div>
            <div
              className="absolute left-1/2 -translate-x-1/2 w-3/4 h-px bg-amber-600/30 z-20"
              style={{ top: "28%" }}
            />
            <div
              className="absolute w-full text-center font-serif text-3xl md:text-4xl text-gray-900 font-medium tracking-tight drop-shadow-sm z-20"
              style={{ top: "52%" }}
            >
              {studentName || "Student Name"}
            </div>
            <div
              className="absolute w-full text-center font-serif text-xl md:text-2xl text-gray-700 italic z-20"
              style={{ top: "64%" }}
            >
              {subject || "Course / Achievement"}
            </div>
            {(timePeriod || extraContent) && (
              <div
                className="absolute w-full text-center text-sm text-gray-600 space-y-0.5 z-20"
                style={{ top: "75%" }}
              >
                {timePeriod && <div>{timePeriod}</div>}
                {extraContent && <div>{extraContent}</div>}
              </div>
            )}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs text-gray-500 tracking-widest uppercase z-20 text-center">
              Issued on {issueDate}
            </div>
            {verifyUrl && (
              <div className="absolute bottom-5 right-8 z-20 flex flex-col items-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=72x72&data=${encodeURIComponent(verifyUrl)}`}
                  alt="Verify certificate"
                  className="w-[72px] h-[72px] bg-white rounded border border-amber-600/30"
                  title="Scan to verify"
                  crossOrigin="anonymous"
                />
                <span className="text-[9px] text-gray-500 mt-0.5 uppercase tracking-wider">Scan to verify</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

CertificatePreview.displayName = "CertificatePreview";
export default CertificatePreview;
