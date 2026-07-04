import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../context/ApiContext";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const { baseURL } = useApi();
   const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [serverError, setServerError] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset errors
    setUsernameError("");
    setPasswordError("");
    setServerError("");

    let isValid = true;

    if (!username.trim()) {
      setUsernameError("Username is required");
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      isValid = false;
    }

    if (!isValid) return;

    setIsLoading(true);

    try {
      const res = await loginUser(baseURL, { username, password });

      // ✅ Store token in context
      if (res?.access_token) {
        login(res.access_token);
        navigate("/hmedianews", { replace: true });
      } else {
        setServerError("Invalid login credentials");
      }
    } catch (err) {
      setServerError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-white text-gray-900 p-4">
      <div className="w-full max-w-lg p-6 sm:p-8 space-y-6 bg-gray-100 rounded-lg shadow-sm border border-gray-200">
        <div className="text-center">
          <img
            src="/images/logo/logo1.png"
            alt="H Media"
            width={100}
            height={50}
            className="mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Enter Username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameError("");
              }}
              className="w-full px-4 py-2.5 bg-white border border-gray-300  focus:outline-none focus:ring-0 focus:border-brand-red rounded-lg"
            />
            {usernameError && (
              <p className="text-sm text-red-600 mt-2">{usernameError}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError("");
              }}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 focus:outline-none focus:ring-0 focus:border-brand-red rounded-lg"
            />
            {passwordError && (
              <p className="text-sm text-red-600 mt-2">{passwordError}</p>
            )}
          </div>

          {serverError && (
            <p className="text-sm text-red-500 text-center">{serverError}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="
              w-full py-3 rounded-lg text-white bg-brand-red hover:bg-brand-dark
              disabled:bg-brand-dark disabled:cursor-not-allowed cursor-pointer
            "
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
