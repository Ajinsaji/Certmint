import React, { forwardRef } from "react";


const CertificatePreview = forwardRef(
  ({ institution, institutionName, studentName, subject, issueDate }, ref) => {
    const displayInstitutionName =
      institution?.name || institutionName || "Institution Name";
    return (
      <div ref={ref} className="flex items-center justify-center bg-cyan-950 p-6">
        <div className="relative w-full max-w-2xl aspect-[3/2] shadow-lg bg-white">

          {/* Certificate Image */}
          <img
            src="/certificate-template.png"
            alt="Certificate Preview"
            className="w-full h-full object-cover"
          />

          {/* Institution Logo */}
          {institution?.logoUrl && (
            <img
              src={`http://localhost:5000${institution.logoUrl}`}
              alt="Institution Logo"
              crossOrigin="anonymous"
              className="absolute top-6 left-1/2 -translate-x-1/2 w-20 h-20 object-contain"
            />
          )}

          {/* Institution Name */}
          <div
            className="absolute w-full text-center font-semibold tracking-wide text-gray-800"
            style={{ top: "22%" }}
          >
            {displayInstitutionName}
          </div>

          {/* Student Name */}
          <div
            className="absolute w-full text-center font-serif text-3xl text-gray-900"
            style={{ top: "53%" }}
          >
            {studentName || "Student Name"}
          </div>

          {/* Subject */}
          <div
            className="absolute w-full text-center font-serif text-xl text-gray-700"
            style={{ top: "65%" }}
          >
            {subject || "Course / Achievement"}
          </div>

          {/* Issue Date */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-sm text-gray-600 text-center tracking-wide">
            Issued on<br />
            {issueDate}
          </div>

        </div>
      </div>
    );
  }
);

export default CertificatePreview;
