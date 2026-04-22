import { useState } from "react";
import { AuthErrorCodes, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SignUp = () => {
    const [error, setError] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignUp = async () => {
        setError('');
        console.log("segning up");
        if (!email.trim() || !password.trim() || !name.trim()) {
            setError('Please enter name, email and password.');
        return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        if (password != confirmPassword) {
            setError('Password does not match.');
            return;
        }

        setLoading(true);
        try {
            createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
            // User account created and signed in
            const user = userCredential.user;
            console.log("User created:", user);

            // user.getIdToken().then((idToken) => {
            //     postData(name, idToken, email, user.uid);
            // });
            console.log('User signed up successfully');

            navigate("/signin");

            })
            .catch((error) => {
            if (error.code === AuthErrorCodes.WEAK_PASSWORD) {
                setError("The password is too weak.");
            } else if (error.code === "auth/email-already-in-use") {
                setError("The email address is already in use.");
            } else if (error.code === AuthErrorCodes.INVALID_EMAIL) {
                setError("The email address is invalid.");
            }
            else if(error.code === 'auth/email-already-in-use') {
                console.log('User already exists.');
            } 
            else {
                console.error("Error creating user:", error.code, error.message);
            }})
        
        } catch (err) {
            setError('Failed to sign up. Please check your credentials and try again.');
            console.error('Sign up error:', err);
        } finally {
            setLoading(false);
        }
    }

    // async function postData(name:string, idToken: string, email: string, userId: String): Promise<void> {
    //         const instance = axios;
    
    //         try {
    //             const response = await instance.post('http://127.0.0.1:8000/users', {
    //                 uid: userId,
    //                 username: name,
    //                 email: email
    //                 }, { headers: {'Authorization': `Bearer ${idToken}`}
    //              });
            
    //             console.log('data:', response.data);
    //             console.log('status:', response.status);
    //         } catch (error: unknown) {
    //             // Type-safe error handling in TS
    //             if (axios.isAxiosError(error)) {
    //                 console.error('Axios error:', error.message);
    //             } else {
    //                 console.error('Unexpected error:', error);
    //             }
    //         }
    // }

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-black via-green-950 to-green-800">
        <div className="rounded-2xl shadow-2xl flex w-full max-w-4xl overflow-hidden bg-linear-to-br from-green-900 via-green-800 to-green-700/90 border border-green-900/40">
            {/* Left Side - Welcome */}
            <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-linear-to-b from-black via-green-900 to-green-700 p-10 text-white">
            <h2 className="text-3xl font-bold mb-4 tracking-wide drop-shadow">WELCOME TO</h2>
            <h1 className="text-3xl font-extrabold mb-2 tracking-widest drop-shadow-lg">SEAT ALLOCATOR</h1>
            <p className="text-lg mb-8 text-green-100">Create your account to get started</p>
                        <div className="mt-8">
                                <p className="mb-2">Already have an account?</p>
                                <button
                                    className="bg-linear-to-r from-green-700 via-green-500 to-green-300 text-green-900 font-semibold px-6 ml-9 py-2 rounded-full shadow hover:from-green-800 hover:to-green-400 hover:text-white transition"
                                    onClick={() => navigate("/")}
                                >Sign In</button>
                        </div>
            </div>
            {/* Right Side - Sign Up Form */}
            <div className="flex flex-col justify-center w-full md:w-1/2 bg-linear-to-b from-white via-green-50 to-green-100/80 p-10">
            <h2 className="text-3xl font-bold text-green-800 mb-6">Sign Up</h2>
            <div className="flex flex-col gap-4">
                <div>
                <label className="block text-sm font-semibold text-green-900 mb-1">Name</label>
                <input className="w-full px-4 py-2 border border-green-200 rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-50 text-green-900" 
                    type="text" 
                    placeholder="Enter your name"
                    onChange={(e) => setName(e.target.value)}
                />
                </div>
                <div>
                <label className="block text-sm font-semibold text-green-900 mb-1">Email</label>
                <input className="w-full px-4 py-2 border border-green-200 rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-50 text-green-900" 
                    type="email" 
                    placeholder="Enter your email"
                    onChange={(e) => setEmail(e.target.value)}
                />
                </div>
                <div>
                <label className="block text-sm font-semibold text-green-900 mb-1">Password</label>
                <input className="w-full px-4 py-2 border border-green-200 rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-50 text-green-900" 
                    type="password" 
                    placeholder="Enter your password"
                    onChange={(e) => setPassword(e.target.value)}
                 />
                </div>
                <div>
                <label className="block text-sm font-semibold text-green-900 mb-1">Confirm Password</label>
                <input className="w-full px-4 py-2 border border-green-200 rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-50 text-green-900" 
                    type="password" 
                    placeholder="Confirm your password" 
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                </div>
                <div className="text-red-600 flex justify-center items-center">{error}</div>
                <button className="mt-6 bg-linear-to-r from-green-800 via-green-700 to-green-500 text-white font-bold py-2 rounded-full shadow hover:from-black hover:to-green-700 transition flex items-center justify-center" onClick={handleSignUp} disabled={loading}>
                    {loading ? (
                        <span className="flex items-center">
                            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                            Signing up...
                        </span>
                    ) : "Sign Up"}
                </button>
            </div>
            </div>
        </div>
        </div>
    )
}

export default SignUp
