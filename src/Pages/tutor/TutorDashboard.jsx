import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import LogoutButton from "../../components/LogoutButton.jsx";

export default function TutorDashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [studentsMap, setStudentsMap] = useState({});
  const [profileLoading, setProfileLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  // tutor profile fields
  const [name, setName] = useState("");
  const [subjects, setSubjects] = useState("");
  const [qualification, setQualification] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [bio, setBio] = useState("");

  const loadProfile = async () => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      setName(data.name || "");
      setSubjects(data.subjects || "");
      setQualification(data.qualification || "");
      setExperienceYears(
        data.experienceYears !== undefined ? String(data.experienceYears) : ""
      );
      setBio(data.bio || "");
    }
    setProfileLoading(false);
  };

  const loadSessionsAndStudents = async () => {
    if (!user) return;

    // sessions for this tutor
    const q = query(
      collection(db, "sessions"),
      where("tutorId", "==", user.uid)
    );
    const snap = await getDocs(q);
    const sessionList = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setSessions(sessionList);

    // load all students once (simple + easy to explain)
    const studentSnap = await getDocs(
      query(collection(db, "users"), where("role", "==", "STUDENT"))
    );
    const map = {};
    studentSnap.docs.forEach((d) => {
      map[d.id] = d.data();
    });
    setStudentsMap(map);
  };

  useEffect(() => {
    loadProfile();
    loadSessionsAndStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const changeStatus = async (id, status) => {
    await updateDoc(doc(db, "sessions", id), { status });
    loadSessionsAndStudents();
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    const ref = doc(db, "users", user.uid);
    await updateDoc(ref, {
      name,
      subjects,
      qualification,
      experienceYears: parseInt(experienceYears || "0", 10),
      bio,
    });
    setSavingProfile(false);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <h1 className="mb-1 text-center text-2xl font-semibold text-slate-800">
  EduConnect
</h1>
<p className="hidden md:block text-lg text-center text-indigo-600">
  Smart Tutor Management System
</p>
          <p className="text-sm text-slate-500">Tutor Portal</p>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 lg:flex-row">
        {/* LEFT: Profile edit */}
        <section className="w-full rounded-xl bg-white p-4 shadow-sm lg:w-1/3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">
              My Profile
            </h2>
            <LogoutButton />
          </div>

          {profileLoading ? (
            <p className="text-sm text-slate-500">Loading profile…</p>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-3 text-sm">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Subjects
                </label>
                <input
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                  placeholder="e.g. Math, Physics"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Qualification
                </label>
                <input
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="e.g. M.Sc Physics"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Experience (years)
                </label>
                <input
                  type="number"
                  min="0"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Short Bio / Description
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Describe your teaching style, board, language, etc."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="mt-2 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {savingProfile ? "Saving..." : "Save Profile"}
              </button>
            </form>
          )}
        </section>

        {/* RIGHT: Sessions table */}
        <section className="w-full rounded-xl bg-white p-4 shadow-sm lg:w-2/3">
          <h2 className="mb-3 text-base font-semibold text-slate-800">
            Session Requests
          </h2>

          {sessions.length === 0 ? (
            <p className="text-sm text-slate-500">
              No session requests assigned to you yet.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Student</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Subject</th>
                    <th className="px-3 py-2">Date &amp; Time</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => {
                    const student = studentsMap[s.studentId];
                    return (
                      <tr key={s.id} className="border-t text-xs">
                        <td className="px-3 py-2">
                          {student ? student.name : s.studentId}
                        </td>
                        <td className="px-3 py-2">
                          {student ? student.email : "-"}
                        </td>
                        <td className="px-3 py-2">{s.subject}</td>
                        <td className="px-3 py-2">{s.sessionDateTime}</td>
                        <td className="px-3 py-2">
                          <span
                            className={
                              "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold " +
                              (s.status === "APPROVED"
                                ? "bg-emerald-100 text-emerald-700"
                                : s.status === "REJECTED"
                                ? "bg-rose-100 text-rose-700"
                                : "bg-amber-100 text-amber-700")
                            }
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          {s.status === "PENDING" ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  changeStatus(s.id, "APPROVED")
                                }
                                className="rounded-lg bg-emerald-600 px-3 py-1 text-[11px] font-medium text-white hover:bg-emerald-700"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  changeStatus(s.id, "REJECTED")
                                }
                                className="rounded-lg bg-rose-600 px-3 py-1 text-[11px] font-medium text-white hover:bg-rose-700"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">
                              No action
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}