import { useState } from "react";
import { sendPasswordResetEmail, fetchSignInMethodsForEmail } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";


const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      // Check if email exists in Firebase Auth
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (!methods || methods.length === 0) {
        setError("No account found with this email address.");
        setLoading(false);
        return;
      }
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      setError(err.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-black via-green-950 to-green-800">
      <div className="rounded-2xl shadow-2xl w-full max-w-md overflow-hidden bg-linear-to-br from-green-900 via-green-800 to-green-700/90 border border-green-900/40 p-10 flex flex-col justify-center">
        <h2 className="text-3xl font-bold text-wite mb-6 text-center">Reset Password</h2>
        <form className="flex flex-col gap-4" onSubmit={handleReset}>
          <div>
            <label className="block text-sm font-semibold text-green-900 mb-1">Email</label>
            <input
              className="w-full px-4 py-2 border border-green-200 rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-50 text-green-900"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-600 flex justify-center items-center">{error}</div>}
          {message && <div className="text-green-600 flex justify-center items-center">{message}</div>}
          <button
            className="mt-6 bg-linear-to-r from-green-800 via-green-700 to-green-500 text-white font-bold py-2 rounded-full shadow hover:from-black hover:to-green-700 transition flex items-center justify-center"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                Sending...
              </span>
            ) : "Send Reset Email"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            className="text-green-300 hover:underline"
            onClick={() => navigate("/")}
          >Back to Sign In</button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
