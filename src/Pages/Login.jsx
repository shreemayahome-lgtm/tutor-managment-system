import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const ref = doc(db, "users", cred.user.uid);
      const snap = await getDoc(ref);
      const role = snap.data().role;

      if (role === "ADMIN") navigate("/admin");
      else if (role === "TUTOR") navigate("/tutor");
      else navigate("/student");
    } catch {
      setError("Invalid Email or Password");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
      {/* blurred gradient blobs in background */}
      <div className="pointer-events-none absolute -left-32 -top-40 h-72 w-72 rounded-full bg-purple-500/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-32 h-80 w-80 rounded-full bg-indigo-500/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-16 left-10 h-64 w-64 rounded-full bg-pink-500/30 blur-3xl" />

      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
        <h1 className="mb-1 text-center text-2xl font-bold text-white">
          Tutor Management System
        </h1>
        <p className="mb-6 text-center text-sm text-indigo-100">
          Login to your portal
        </p>

        {error && (
          <p className="mb-3 rounded-lg bg-rose-100/90 px-3 py-2 text-sm text-rose-800">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-sm">
          <div>
            <label className="mb-1 block text-xs font-medium text-indigo-100">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-lg border border-white/30 bg-white/15 px-3 py-2 text-sm text-white placeholder-white/60 outline-none focus:border-white focus:ring-1 focus:ring-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-indigo-100">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-white/30 bg-white/15 px-3 py-2 text-sm text-white placeholder-white/60 outline-none focus:border-white focus:ring-1 focus:ring-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-indigo-100">
          Don&apos;t have an account?{" "}
          <Link
            className="font-medium text-violet-200 hover:underline"
            to="/signup"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}