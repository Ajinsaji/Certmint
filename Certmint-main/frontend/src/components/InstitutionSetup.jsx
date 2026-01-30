import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

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

  const handleLogoChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };



  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center px-5">
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
      </div>
    </section>
  );
};

export default InstitutionSetup;
