import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignupPage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Signup failed");
        setLoading(false);
        return;
      }

      // save token + user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // redirect based on role
      if (data.user.role === "STUDENT") {
        navigate("/student-dashboard");
      } else if (data.user.role === "INSTITUTION") {
        navigate("/institution-dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen">
        


        <div className="w-full bg-white rounded-lg shadow sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6">
            <h1 className="text-xl font-bold text-center leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Create Account
            </h1>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <form className="space-y-4 px-3 md:space-y-6" onSubmit={handleSubmit}>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg 
                             focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 
                             dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
                             dark:text-white"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="bg-gray-50 border border-gray-300 text-white rounded-lg 
                             focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 
                             dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password"
                  className="bg-gray-50 border border-gray-300 text-white rounded-lg 
                             focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 
                             dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              {/* ROLE DROPDOWN */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Select Role
                </label>

                <div className="flex w-full bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                    
                    {/* STUDENT OPTION */}
                    <button
                    type="button"
                    onClick={() => setRole("STUDENT")}
                    className={`w-1/2 py-2.5 text-sm font-medium transition
                        ${role === "STUDENT"
                        ? "bg-primary-600 text-white btn-primary"
                        : "text-gray-700 dark:text-gray-300"
                        }
                    `}
                    >
                    Student
                    </button>

                    {/* INSTITUTION OPTION */}
                    <button
                    type="button"
                    onClick={() => setRole("INSTITUTION")}
                    className={`w-1/2 py-2.5 text-sm font-medium transition 
                        ${role === "INSTITUTION"
                        ? "bg-primary-600 text-white btn-primary"
                        : "text-gray-700 dark:text-gray-300"
                        }
                    `}
                    >
                    Institution
                    </button>

                </div>
                </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white bg-primary-600 hover:bg-primary-700 btn-primary
                           focus:ring-4 focus:outline-none focus:ring-primary-300 
                           font-medium rounded-lg text-sm px-5 py-2.5 text-center 
                           dark:bg-primary-600 dark:hover:bg-primary-700 disabled:opacity-60"
              >
                {loading ? "Creating..." : "Sign up"}
              </button>

              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Already have an account?{" "}
                <a href="/login" className="font-medium text-primary-600 hover:underline">
                  Login
                </a>
              </p>

            </form>
          </div>
        </div>

      </div>
    </section>
  );
};

export default SignupPage;
