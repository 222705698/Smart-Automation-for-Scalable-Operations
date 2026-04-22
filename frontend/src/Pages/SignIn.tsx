
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const SignIn = () => {
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const userCredentials = await signInWithEmailAndPassword(auth, email, password);
            console.log(userCredentials.user)
            
            navigate("/dashboard");
        } catch (err: any) {
            setError(err.message || "Failed to sign in.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-black via-green-950 to-green-800">
        <div className="rounded-2xl shadow-2xl flex w-full max-w-4xl overflow-hidden bg-linear-to-br from-green-900 via-green-800 to-green-700/90 border border-green-900/40">
            {/* Left Side - Welcome */}
            <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-linear-to-b from-black via-green-900 to-green-700 p-10 text-white">
            <h2 className="text-3xl font-bold mb-4 tracking-wide drop-shadow">WELCOME TO</h2>
            <h1 className="text-3xl font-extrabold mb-2 tracking-widest drop-shadow-lg">SEAT ALLOCATOR</h1>
            <p className="text-lg mb-8 text-green-100">Your trusted seat allocator</p>
            <div className="mt-8">
                <p className="mb-2">Don't have an account?</p>
                <button
                  className="bg-linear-to-r from-green-700 via-green-500 to-green-300 text-green-900 font-semibold px-8 ml-5 py-2 rounded-full shadow hover:from-green-800 hover:to-green-400 hover:text-white transition"
                  onClick={() => navigate("/signup")}
                >Sign Up</button>
            </div>
            </div>
            {/* Right Side - Sign In Form */}
            <div className="flex flex-col justify-center w-full md:w-1/2 bg-linear-to-b from-white via-green-50 to-green-100/80 p-10">
            <h2 className="text-3xl font-bold text-green-800 mb-6">Sign In</h2>
            <form className="flex flex-col gap-4" onSubmit={handleSignIn}>
                <div>
                <label className="block text-sm font-semibold text-green-900 mb-1">Email</label>
                <input className="w-full px-4 py-2 border border-green-200 rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-50 text-green-900" 
                    type="email" 
                    placeholder="Enter your email" 
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    required
                />
                </div>
                <div>
                <label className="block text-sm font-semibold text-green-900 mb-1">Password</label>
                <input className="w-full px-4 py-2 border border-green-200 rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-50 text-green-900" 
                    type="password" 
                    placeholder="Enter your password" 
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    required
                />
                </div>
                <div className="flex items-center justify-between text-xs text-green-700 mt-2">
                <label className="flex items-center gap-2">
                    <input type="checkbox" className="accent-green-700" /> Remember me?
                </label>
                <button
                  type="button"
                  className="hover:underline"
                  onClick={() => navigate("/forgot-password")}
                >Forgot password?</button>
                </div>
                {error && <div className="text-red-600 flex justify-center items-center">{error}</div>}
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
                      Signing in...
                    </span>
                  ) : "Sign In"}
                </button>
            </form>
            </div>
        </div>
        </div>
    );
}

export default SignIn;
