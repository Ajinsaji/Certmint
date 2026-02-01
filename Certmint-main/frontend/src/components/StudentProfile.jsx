import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileBanner from "./ProfileBanner";

const API_BASE = "http://localhost:5000/api/auth";

export default function StudentProfile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const didFetchRef = useRef(false);

  useEffect(() => {
    if (!token || !storedUser || storedUser.role !== "STUDENT") {
      navigate("/login");
      return;
    }
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || "Failed to load profile");
          return;
        }
        setProfile(data);
        setName(data.name || "");
        setEmail(data.email || "");
      } catch (err) {
        setError("Server error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, token, storedUser]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Update failed");
        return;
      }
      setProfile(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      setSuccess("Profile updated successfully.");
      setEditing(false);
    } catch (err) {
      setError("Server error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        Loading profile…
      </div>
    );
  }

  if (!storedUser || storedUser.role !== "STUDENT") {
    return null;
  }

  return (
    <>
      <ProfileBanner
        title={profile?.name || storedUser?.name || "Profile"}
        subtitle={profile?.email || storedUser?.email || ""}
        logoUrl={null}
        role="STUDENT"
      />

      <div className="bg-gray-900 min-h-screen flex justify-center px-6 py-10">
        <div className="w-full max-w-lg">
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-6 space-y-6">
            <h2 className="text-2xl font-bold text-white border-b border-gray-600 pb-3">
              My Profile
            </h2>

            {error && (
              <p className="text-sm text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-green-400 bg-green-900/20 border border-green-500/30 rounded-lg px-3 py-2">
                {success}
              </p>
            )}

            {editing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your@email.com"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setName(profile?.name || "");
                      setEmail(profile?.email || "");
                      setError("");
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div>
                  <p className="text-sm text-gray-400">Name</p>
                  <p className="text-lg text-white font-medium">{profile?.name || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-lg text-white font-medium">{profile?.email || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Role</p>
                  <p className="text-lg text-white font-medium">{profile?.role || "STUDENT"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                >
                  Edit Profile
                </button>
              </>
            )}

            <div className="pt-4 border-t border-gray-600">
              <button
                type="button"
                onClick={() => navigate("/student-dashboard")}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                ← Back to dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
