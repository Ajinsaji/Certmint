import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import InstitutionHeader from "./InstitutionHeader";

const InstitutionSetup = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
  const fetchInstitution = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/institution/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return;

      const data = await res.json();

      let line1 = "";
      let district = "";
      let state = "";
      let pincode = "";

      if (data.address) {

        const parts = data.address.split(",");

        line1 = parts[0]?.trim() || "";
        district = parts[1]?.trim() || "";

        if (parts[2]) {
          const statePin = parts[2].split("-");
          state = statePin[0]?.trim() || "";
          pincode = statePin[1]?.trim() || "";
        }
      }

      setForm({
        line1,
        district,
        state,
        pincode,
        contactNumber: data.contactNumber || "",
        locationUrl: data.locationUrl || "",
      });
    } catch (err) {
      console.error("Auto-fill failed", err);
    }
  };

  fetchInstitution();
}, [token]);


  const [form, setForm] = useState({
    line1: "",
    line2: "",
    district: "",
    state: "",
    pincode: "",
    contactNumber: "",
    locationUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLogoChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };



  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/change-password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.message || "Failed to change password");
        setPasswordLoading(false);
        return;
      }
      setPasswordSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setPasswordError("Server error");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("name", user.name);
      formData.append("contactNumber", form.contactNumber);
      formData.append("locationUrl", form.locationUrl);

      formData.append(
        "address",
        JSON.stringify({
          line1: form.line1,
          district: form.district,
          state: form.state,
          pincode: form.pincode,
        })
      );

      if (logoFile) {
        formData.append("logo", logoFile); // 🔥 THIS is the DP
      }

      const res = await fetch("http://localhost:5000/api/institution/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // ❗ NO Content-Type
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Setup failed");
        return;
      }

      navigate("/institution-dashboard");
    } catch (err) {
      console.error(err);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <InstitutionHeader
        title={user?.name || "Institution"}
        subtitle={user?.email || ""}
        logoUrl={null}
      />
      <section className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow px-12 py-10 space-y-5">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
            Complete Institution Profile
          </h2>

        <p className="text-sm text-center text-gray-500">
          Add your institution's details to get started.
        </p>



        {error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Logo Upload */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-700">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Institution Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm text-gray-500 text-center px-2">
                Logo
              </span>
            )}
          </div>

          <label className="text-sm font-medium text-blue-600 cursor-pointer hover:underline">
            Upload Logo
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
          </label>
        </div>

          <input
            name="line1"
            value={form.line1}
            placeholder="Address line 1"
            onChange={handleChange}
            className="input-field"
            required
          />
        

          <div className="grid grid-cols-2 gap-3">
            <input name="district" required placeholder="District"
              onChange={handleChange}
              className="input-field"
              value={form.district}
            />
            <input name="state" required placeholder="State"
              onChange={handleChange}
              className="input-field"
              value={form.state}
            />
          </div>

          <input name="pincode" placeholder="Pincode"
            onChange={handleChange}
            className="input-field"
            value={form.pincode}
          />

          <input name="contactNumber" required placeholder="Contact Number"
            onChange={handleChange}
            className="input-field"
            value={form.contactNumber}
          />

          <input name="locationUrl" placeholder="Google Maps URL (optional)"
            onChange={handleChange}
            className="input-field"
            value={form.locationUrl}
          />
            <div className="pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary py-3 disabled:opacity-60"
                >
                    {loading ? "Saving..." : "Save & Continue"}
                </button>
            </div>
        </form>

        {/* Change password */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Change password</h3>
          {passwordError && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md px-3 py-2 mb-3">
              {passwordError}
            </p>
          )}
          {passwordSuccess && (
            <p className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md px-3 py-2 mb-3">
              {passwordSuccess}
            </p>
          )}
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input-field pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label={showCurrentPassword ? "Hide password" : "Show password"}
              >
                {showCurrentPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="New password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field pr-10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full py-3 rounded-md font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60 transition"
            >
              {passwordLoading ? "Updating..." : "Change password"}
            </button>
          </form>
        </div>
      </div>
    </section>
    </>
  );
};

export default InstitutionSetup;
