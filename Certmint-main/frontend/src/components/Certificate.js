export default function CertificateCard({ cert }) {
  if (!cert) return null;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl shadow hover:shadow-xl transition-all overflow-hidden">

      {/* 3:4 Ratio Container */}
      <div className="aspect-[3/4] flex flex-col justify-between p-5 text-center">

        {/* Top Section */}
        <div>
          {/* Subject */}
          <h4 className="
            text-blue-400
            font-semibold
            tracking-wide
            text-xl
            sm:text-2xl
            lg:text-3xl
            leading-tight
            line-clamp-2
          ">
            {cert.subject}
          </h4>


          {/* Institution */}
          <p className="text-gray-400 text-xl mt-1">
            {cert.institutionNameSnapshot}
          </p>

          {/* Divider */}
          <div className="w-12 h-[1px] bg-gray-600 mx-auto my-4" />

          {/* Student */}
          <p className="text-gray-200 text-2xl font-medium">
            {cert.studentNameSnapshot}
          </p>

          {cert.studentEmailSnapshot && (
            <p className="text-gray-500 text-xs mt-1 truncate">
              {cert.studentEmailSnapshot}
            </p>
          )}
        </div>

        {/* Bottom Section */}
        <div>
          {/* Date */}
          <p className="text-gray-400 text-xs mb-4">
            Issued on{" "}
            {new Date(cert.dateOfIssue).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>

          {/* Action */}
          <button
            onClick={() => window.open(`/certificate/${cert.id}`, "_blank")}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition"
          >
            View
          </button>
        </div>

      </div>
    </div>
  );
}
