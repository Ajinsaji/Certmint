import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API = "http://localhost:5000/api/auth";

export default function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null); // "STUDENT" | "INSTITUTION"

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Student fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [courseName, setCourseName] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Institution fields
  const [institutionName, setInstitutionName] = useState("");
  const [instEmail, setInstEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [documentFile, setDocumentFile] = useState(null);

  const handleRoleSelect = (r) => {
    setRole(r);
    setError("");
    setSuccessMessage("");
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API}/signup/student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          courseName: courseName.trim() || undefined,
          dateOfBirth: dob || undefined,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Signup failed");
        setLoading(false);
        return;
      }
      setSuccessMessage(data.message || "Signup successful. Please login.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError("Server error");
      setLoading(false);
    }
  };

  const handleInstitutionSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!institutionName.trim() || !instEmail.trim()) {
      setError("Institution name and email are required");
      setLoading(false);
      return;
    }
    if (!documentFile) {
      setError("Please upload an institution document or license (PDF, image, or document)");
      setLoading(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append("institutionName", institutionName.trim());
      formData.append("email", instEmail.trim().toLowerCase());
      formData.append("phone", phone.trim());
      formData.append("address", address.trim());
      formData.append("document", documentFile);
      const res = await fetch(`${API}/signup/institution`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Request failed");
        setLoading(false);
        return;
      }
      setSuccessMessage(data.message || "Request sent to admin. You will be able to login after approval. Else contact admin certimintadmin@gmail.com");
      setLoading(false);
    } catch (err) {
      setError("Server error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="rounded-2xl border border-white/10 bg-slate-800/50 shadow-2xl backdrop-blur-sm overflow-hidden">
          <div className="p-8 sm:p-10">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white sm:text-3xl">Create account</h1>
              <p className="mt-2 text-slate-400 text-sm">
                {step === 1 ? "Choose your account type" : role === "STUDENT" ? "Student details" : "Institution details"}
              </p>
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect("STUDENT")}
                    className={`flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition ${
                      role === "STUDENT"
                        ? "border-blue-500 bg-blue-500/20 text-blue-300"
                        : "border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500 hover:bg-slate-700"
                    }`}
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </span>
                    <span className="font-semibold">Student</span>
                    <span className="text-xs text-slate-400">Sign up and login immediately</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect("INSTITUTION")}
                    className={`flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition ${
                      role === "INSTITUTION"
                        ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                        : "border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500 hover:bg-slate-700"
                    }`}
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </span>
                    <span className="font-semibold">Institution</span>
                    <span className="text-xs text-slate-400">Request access; admin approves</span>
                  </button>
                </div>
                {role && (
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 transition"
                  >
                    Continue
                  </button>
                )}
              </div>
            )}

            {step === 2 && role === "STUDENT" && (
              <form onSubmit={handleStudentSubmit} className="space-y-4">
                <button
                  type="button"
                  onClick={() => { setStep(1); setRole(null); setError(""); }}
                  className="text-sm text-slate-400 hover:text-white flex items-center gap-1"
                >
                  ← Back
                </button>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Full name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Course name</label>
                  <input
                    type="text"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="e.g. Computer Science, BCA, MBA"
                    className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Date of birth (optional)</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Confirm password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                {successMessage && <p className="text-sm text-emerald-400">{successMessage}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 transition disabled:opacity-60"
                >
                  {loading ? "Creating account..." : "Sign up"}
                </button>
              </form>
            )}

            {step === 2 && role === "INSTITUTION" && (
              <form onSubmit={handleInstitutionSubmit} className="space-y-4">
                <button
                  type="button"
                  onClick={() => { setStep(1); setRole(null); setError(""); setSuccessMessage(""); }}
                  className="text-sm text-slate-400 hover:text-white flex items-center gap-1"
                >
                  ← Back
                </button>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Institution name</label>
                  <input
                    type="text"
                    required
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    placeholder="Acme University"
                    className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={instEmail}
                    onChange={(e) => setInstEmail(e.target.value)}
                    placeholder="admin@institution.com"
                    className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Phone (optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 234 567 8900"
                    className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Address (optional)</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="City, State, Country"
                    className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Institution document / license</label>
                  <p className="text-xs text-slate-500 mb-2">Upload a PDF, image, or document (max 10MB)</p>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,image/*,application/pdf"
                    required
                    onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white file:mr-3 file:rounded file:border-0 file:bg-slate-600 file:px-3 file:py-1 file:text-sm file:text-white"
                  />
                  {documentFile && (
                    <p className="mt-1 text-xs text-slate-400">Selected: {documentFile.name}</p>
                  )}
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                {successMessage && <p className="text-sm text-emerald-400">{successMessage}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-60"
                >
                  {loading ? "Sending request..." : "Sign up & send request"}
                </button>
              </form>
            )}
          </div>

          <div className="border-t border-white/10 px-8 py-4 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
