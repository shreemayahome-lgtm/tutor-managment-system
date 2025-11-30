import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // extra fields for tutors
  const [subjects, setSubjects] = useState("");
  const [qualification, setQualification] = useState("");
  const [experienceYears, setExperienceYears] = useState("");

  // extra fields for students
  const [studentClass, setStudentClass] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [board, setBoard] = useState("");

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      let extra = {};
      if (role === "TUTOR") {
        extra = {
          subjects,
          qualification,
          experienceYears: parseInt(experienceYears || "0", 10),
        };
      } else if (role === "STUDENT") {
        extra = {
          studentClass,
          schoolName,
          contactNumber,
          board,
        };
      }

      await setDoc(doc(db, "users", cred.user.uid), {
        name,
        email,
        role,
        ...extra,
        createdAt: new Date(),
      });

      if (role === "TUTOR") navigate("/tutor");
      else navigate("/student");
    } catch (err) {
      setError("Could not create account. " + err.message);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
      {/* background blobs like login */}
      <div className="pointer-events-none absolute -left-28 -top-24 h-72 w-72 rounded-full bg-indigo-500/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-32 h-80 w-80 rounded-full bg-purple-500/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-4rem] left-10 h-64 w-64 rounded-full bg-pink-500/25 blur-3xl" />

      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-2xl">
        <h1 className="mb-1 text-center text-2xl font-bold text-white">
          Create an Account
        </h1>
        <p className="mb-6 text-center text-sm text-indigo-100">
          Sign up as a Student or Tutor
        </p>

        {error && (
          <p className="mb-3 rounded-lg bg-rose-100/90 px-3 py-2 text-sm text-rose-800">
            {error}
          </p>
        )}

        <form onSubmit={handleSignup} className="space-y-4 text-sm">
          {/* Name */}
          <div>
            <label className="mb-1 block text-xs font-medium text-indigo-100">
              Full Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-white/30 bg-white/15 px-3 py-2 text-sm text-white placeholder-white/60 outline-none focus:border-white focus:ring-1 focus:ring-white"
              placeholder="Enter your name"
            />
          </div>

          {/* Role */}
          <div>
            <label className="mb-1 block text-xs font-medium text-indigo-100">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border border-white/30 bg-white/15 px-3 py-2 text-sm text-white outline-none focus:border-white focus:ring-1 focus:ring-white"
            >
              <option value="STUDENT" className="text-slate-900">
                Student
              </option>
              <option value="TUTOR" className="text-slate-900">
                Tutor
              </option>
            </select>
          </div>

          {/* TUTOR extra fields */}
          {role === "TUTOR" && (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium text-indigo-100">
                  Subjects you teach
                </label>
                <input
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                  placeholder="e.g. Math, Physics"
                  required
                  className="w-full rounded-lg border border-white/30 bg-white/15 px-3 py-2 text-sm text-white placeholder-white/60 outline-none focus:border-white focus:ring-1 focus:ring-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-indigo-100">
                  Qualification
                </label>
                <input
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="e.g. B.Sc Mathematics"
                  required
                  className="w-full rounded-lg border border-white/30 bg-white/15 px-3 py-2 text-sm text-white placeholder-white/60 outline-none focus:border-white focus:ring-1 focus:ring-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-indigo-100">
                  Experience (years)
                </label>
                <input
                  type="number"
                  min="0"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  placeholder="e.g. 2"
                  className="w-full rounded-lg border border-white/30 bg-white/15 px-3 py-2 text-sm text-white placeholder-white/60 outline-none focus:border-white focus:ring-1 focus:ring-white"
                />
              </div>
            </>
          )}

          {/* STUDENT extra fields */}
          {role === "STUDENT" && (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium text-indigo-100">
                  Class / Grade
                </label>
                <input
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  placeholder="e.g. 10th, 1st year"
                  className="w-full rounded-lg border border-white/30 bg-white/15 px-3 py-2 text-sm text-white placeholder-white/60 outline-none focus:border-white focus:ring-1 focus:ring-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-indigo-100">
                  School / College Name
                </label>
                <input
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="e.g. ABC Public School"
                  className="w-full rounded-lg border border-white/30 bg-white/15 px-3 py-2 text-sm text-white placeholder-white/60 outline-none focus:border-white focus:ring-1 focus:ring-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-indigo-100">
                  Board
                </label>
                <input
                  value={board}
                  onChange={(e) => setBoard(e.target.value)}
                  placeholder="e.g. CBSE, ICSE, MP Board"
                  className="w-full rounded-lg border border-white/30 bg-white/15 px-3 py-2 text-sm text-white placeholder-white/60 outline-none focus:border-white focus:ring-1 focus:ring-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-indigo-100">
                  Contact Number
                </label>
                <input
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full rounded-lg border border-white/30 bg-white/15 px-3 py-2 text-sm text-white placeholder-white/60 outline-none focus:border-white focus:ring-1 focus:ring-white"
                />
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="mb-1 block text-xs font-medium text-indigo-100">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-lg border border-white/30 bg-white/15 px-3 py-2 text-sm text-white placeholder-white/60 outline-none focus:border-white focus:ring-1 focus:ring-white"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-1 block text-xs font-medium text-indigo-100">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-lg border border-white/30 bg-white/15 px-3 py-2 text-sm text-white placeholder-white/60 outline-none focus:border-white focus:ring-1 focus:ring-white"
            />
          </div>

          <button
            type="submit"
            className="mt-1 w-full rounded-xl bg-white/95 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-indigo-100">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-violet-200 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}