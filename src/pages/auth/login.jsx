import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../services/api";

export default function Login() {
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      errors.email = "Please enter a valid email address (e.g., name@domain.com)";
    } else if (email.length > 254) {
      errors.email = "Email is too long";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (password.length > 128) {
      errors.password = "Password is too long";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const response = await authService.login(email, password);
      console.log("🔵 Full response:", response);

      // ✅ Check if login failed
      if (response.success === false) {
        console.log('🔴 Login failed with message:', response.message);
        console.log('🔴 Error code:', response.code);

        // Check for volunteer status messages
        if (response.code === 'PENDING_APPROVAL' ||
          (response.message && response.message.includes('pending approval'))) {
          setError('⏳ Your volunteer application is pending approval. Please wait for the rescue team to review your application.');
          setLoading(false);
          return;
        }

        if (response.code === 'REJECTED' ||
          (response.message && response.message.includes('rejected'))) {
          setError('❌ Your volunteer application has been rejected. Please contact support for more information.');
          setLoading(false);
          return;
        }

        if (response.code === 'NOT_APPROVED' ||
          (response.message && response.message.includes('not yet approved'))) {
          setError('⚠️ Your volunteer account is not yet approved. Please contact the rescue team.');
          setLoading(false);
          return;
        }

        if (response.message && response.message.includes('deactivated')) {
          setError('⚠️ Your account is deactivated. Please contact support.');
          setLoading(false);
          return;
        }

        setError(response.message || "Login failed.");
        setLoading(false);
        return;
      }

      // ✅ Successful login
      let userData = response.user;
      let token = response.token;

      console.log("✅ User data:", userData);
      console.log("✅ Token:", token);

      if (userData && token) {
        const userToStore = {
          id: userData.id || userData._id,
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          role: userData.role || "civilian",
          phoneNumber: userData.phoneNumber || "",
          profileImage: userData.profileImage || ""
        };

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userToStore));
        localStorage.setItem('userRole', userData.role || 'civilian');

        if (userData.profileImage) {
          localStorage.setItem('profileImage', userData.profileImage);
        }

        // ✅ FIXED: Role-based redirect with 2-second delay
        const userRole = userData.role || 'civilian';
        console.log("🔄 Redirecting based on role:", userRole);

        // Show loading for 2 seconds before redirecting
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 🚨 CRITICAL FIX: Admin should go to /admin/overview first
        if (userRole === "admin") {
          navigate("/admin/overview");
        } else if (userRole === "dispatcher" || userRole === "responder") {
          navigate("/dashboard");
        } else if (userRole === "volunteer") {
          navigate("/volunteer-dashboard");
        } else if (userRole === "civilian") {
          navigate("/civilian-dashboard");
        } else {
          // Fallback
          navigate("/dashboard");
        }
      } else {
        setError("Invalid response from server");
        setLoading(false);
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      setError(err.message || "Login failed. Please try again.");
      setLoading(false);
    }
  };

  // Show full-screen spinner when loading
  if (loading) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-16 w-16 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-700 font-medium text-lg">Logging in...</p>
          <p className="text-gray-400 text-sm">Please wait while we redirect you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center px-4 sm:px-6 md:px-10 py-6">
      <div className="w-full max-w-6xl py-10">
        <div className="flex items-center gap-3 mb-8">
          <img src="/logo.png" alt="logo" className="h-10 w-10 object-cover" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1E252B]">
            Rescue Team
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-4xl font-semibold text-gray-800 mb-3">
              Login to your account
            </h2>
            <p className="text-gray-500 text-sm mb-8">
              Access the Central Luzon Emergency Response operations command platform.
            </p>

            {error && (
              <div className={`mb-4 p-3 rounded-md text-sm ${error.includes('⏳') || error.includes('⚠️')
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
                }`}>
                {error}
              </div>
            )}

            <div className="w-full mb-5">
              <fieldset className={`border-2 rounded-lg px-4 pt-2 pb-2 bg-[#F3F6FA] focus-within:border-blue-500 ${validationErrors.email ? 'border-red-500' : 'border-gray-400'
                }`}>
                <legend className="text-sm px-2 text-gray-700">Email</legend>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationErrors.email) {
                      setValidationErrors({ ...validationErrors, email: null });
                    }
                  }}
                  placeholder="john.doe@gmail.com"
                  className="w-full bg-transparent outline-none placeholder-gray-400 text-sm sm:text-base"
                />
              </fieldset>
              {validationErrors.email && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
              )}
            </div>

            <div className="w-full">
              <fieldset className={`border-2 rounded-lg px-4 pt-2 pb-2 bg-[#F3F6FA] focus-within:border-blue-500 ${validationErrors.password ? 'border-red-500' : 'border-gray-400'
                }`}>
                <legend className="text-sm px-2 text-gray-700">Password</legend>
                <div className="flex items-center">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (validationErrors.password) {
                        setValidationErrors({ ...validationErrors, password: null });
                      }
                    }}
                    placeholder="••••••••"
                    className="w-full bg-transparent outline-none placeholder-gray-400 text-sm sm:text-base"
                  />
                  <span onClick={() => setShowPass(!showPass)} className="cursor-pointer text-gray-500 ml-2">
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </fieldset>
              {validationErrors.password && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between mt-2 mb-6">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" className="w-4 h-4" />
                Remember me
              </label>
              <button className="text-sm text-red-400 hover:underline">
                Forgot Password
              </button>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Login
            </button>

            <p className="text-center text-sm text-gray-600 mt-5">
              Don't have an account?{" "}
              <Link to="/signup" className="text-red-400 font-medium hover:underline cursor-pointer">
                Sign up
              </Link>
            </p>

          </div>

          <div className="hidden md:block">
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img src="/shers.png" alt="building" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}