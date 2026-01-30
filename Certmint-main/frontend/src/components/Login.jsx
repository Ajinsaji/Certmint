import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000/api/auth/login"; 

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Something went wrong.");
      setLoading(false);
      return;
    }

    // ✅ Save token + user
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    if (data.user.role === "STUDENT") {
        navigate("/student-dashboard");
        } else if (data.user.role === "INSTITUTION") {
        navigate("/institution-dashboard");
        } else if (data.user.role === "ADMIN") {
        navigate("/admin-dashboard");
        } else {
        navigate("/"); // fallback
        }
  } catch (err) {
    console.error("Login error:", err);
    setError("Server error");
  } finally {
    setLoading(false);
  }
};


  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
     

        <div className="w-full bg-white rounded-lg  shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold text-center leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Login
            </h1>

            {/* Error message */}
            {error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Your email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg 
                             focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 
                             dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
                             dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg 
                             focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 
                             dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
                             dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white bg-primary-600 hover:bg-primary-700 
                           focus:ring-4 focus:outline-none focus:ring-primary-300 
                           font-medium rounded-lg text-sm px-5 py-2.5 text-center 
                           dark:bg-primary-600 dark:hover:bg-primary-700 
                           dark:focus:ring-primary-800 disabled:opacity-60 disabled:cursor-not-allowed btn-primary"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>

              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Don’t have an account yet?{" "}
                <a
                  href="/signup"
                  className="text-gray-500 dark:text-gray-300 font-medium text-primary-600 hover:underline dark:text-primary-500"
                >
                  Sign up
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
