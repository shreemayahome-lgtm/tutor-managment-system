import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import LogoutButton from "../../components/LogoutButton.jsx";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [tutors, setTutors] = useState([]);
  const [selectedTutorId, setSelectedTutorId] = useState("");
  const [subject, setSubject] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [message, setMessage] = useState("");
  const [mySessions, setMySessions] = useState([]);
  const [subjectFilter, setSubjectFilter] = useState("");

  // student profile state
  const [profileLoading, setProfileLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [board, setboard] = useState("");

  const loadTutors = async () => {
    const q = query(collection(db, "users"), where("role", "==", "TUTOR"));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setTutors(list);
  };

  const loadMySessions = async () => {
    if (!user) return;
    const q = query(
      collection(db, "sessions"),
      where("studentId", "==", user.uid)
    );
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setMySessions(list);
  };

  const loadProfile = async () => {
    if (!user) return;
    setProfileLoading(true);
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      setStudentName(data.name || "");
      setStudentEmail(data.email || "");
      setStudentClass(data.studentClass || "");
      setSchoolName(data.schoolName || "");
      setContactNumber(data.contactNumber || "");
      setboard(data.board || "");
    }
    setProfileLoading(false);
  };

  useEffect(() => {
    loadTutors();
  }, []);

  useEffect(() => {
    if (user) {
      loadMySessions();
      loadProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleRequest = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!selectedTutorId || !subject || !dateTime) {
      setMessage("Please fill all fields.");
      return;
    }

    await addDoc(collection(db, "sessions"), {
      tutorId: selectedTutorId,
      studentId: user.uid,
      subject,
      sessionDateTime: dateTime,
      status: "PENDING",
      createdAt: serverTimestamp(),
    });

    setMessage("Session request sent!");
    setSubject("");
    setDateTime("");
    setSelectedTutorId("");
    loadMySessions();
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    const ref = doc(db, "users", user.uid);
    await updateDoc(ref, {
      name: studentName,
      studentClass,
      schoolName,
      contactNumber,
      board,
    });
    setSavingProfile(false);
  };

  const tutorNameById = (id) => {
    const t = tutors.find((t) => t.id === id);
    return t ? t.name : id;
  };

  const filteredTutors = tutors.filter((t) => {
    if (!subjectFilter.trim()) return true;
    const subs = (t.subjects || "").toLowerCase();
    return subs.includes(subjectFilter.toLowerCase());
  });

  const getInitials = (name) => {
    if (!name) return "T";
    const parts = name.split(" ").filter(Boolean);
    const initials = parts.slice(0, 2).map((p) => p[0].toUpperCase());
    return initials.join("") || "T";
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold text-slate-800">
            Tutor Management System
          </h1>
          <p className="text-sm text-slate-500">Student Portal</p>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 lg:flex-row">
        {/* LEFT: Tutors + Request form */}
        <div className="w-full space-y-4 lg:w-1/2">
          <section className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-slate-800">
                Available Tutors
              </h2>
              <input
                type="text"
                placeholder="Filter by subject"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="w-40 rounded-lg border border-slate-300 px-2 py-1 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {filteredTutors.length === 0 ? (
              <p className="text-sm text-slate-500">
                No tutors match this subject.
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {filteredTutors.map((t) => (
                  <div
                    key={t.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar circle */}
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-violet-500 text-[11px] font-semibold text-white shadow-sm">
                        {getInitials(t.name)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-900">
                            {t.name}
                          </p>
                          {t.isVerified && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                              ✅ Verified
                            </span>
                          )}
                        </div>
    

                        {t.bio && (
                          <p className="mt-1 line-clamp-2 text-[11px] text-slate-600">
                            {t.bio}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 space-y-1">
                      {t.subjects && (
                        <p className="text-[11px]">
                          <span className="font-semibold text-slate-700">
                            Subjects:
                          </span>{" "}
                          {t.subjects}
                        </p>
                      )}
                      {t.qualification && (
                        <p className="text-[11px]">
                          <span className="font-semibold text-slate-700">
                            Qualification:
                          </span>{" "}
                          {t.qualification}
                        </p>
                      )}
                      {typeof t.experienceYears === "number" &&
                        t.experienceYears > 0 && (
                          <p className="text-[11px]">
                            <span className="font-semibold text-slate-700">
                              Experience:
                            </span>{" "}
                              {t.experienceYears} years
                          </p>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-slate-800">
              Request a Session
            </h2>
            {message && (
              <p className="mb-2 text-sm text-emerald-600">{message}</p>
            )}
            <form onSubmit={handleRequest} className="space-y-3 text-sm">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Choose Tutor
                </label>
                <select
                  value={selectedTutorId}
                  onChange={(e) => setSelectedTutorId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select tutor</option>
                  {tutors.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Subject
                </label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Send Request
              </button>
            </form>
          </section>
        </div>

        {/* RIGHT: Profile + My Sessions */}
        <div className="w-full lg:w-1/2">
          <section className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800">
                My Profile & Sessions
              </h2>
              <LogoutButton />
            </div>

            {/* Profile box */}
            <div className="mb-4 rounded-lg bg-slate-50 p-3">
              {profileLoading ? (
                <p className="text-sm text-slate-500">Loading profile…</p>
              ) : (
                <form
                  onSubmit={handleSaveProfile}
                  className="grid gap-3 text-sm md:grid-cols-2"
                >
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Name
                    </label>
                    <input
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Email 
                    </label>
                    <input
                      value={studentEmail}
                      disabled
                      className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Class 
                    </label>
                    <input
                      value={studentClass}
                      onChange={(e) => setStudentClass(e.target.value)}
                      placeholder="e.g. 10th, 1st year"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Contact Number
                    </label>
                    <input
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div >
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      School / College
                    </label>
                    <input
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="e.g. ABC Public School"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div >
                    <label className="mb-1 block text-xs font-medium text-slate-600">
                      Board
                    </label>
                    <input
                      value={board}
                      onChange={(e) => setboard(e.target.value)}
                      placeholder="e.g. CBSE , ICSE"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="w-full rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-black disabled:opacity-60"
                    >
                      {savingProfile ? "Saving…" : "Save Profile"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Sessions table */}
            {mySessions.length === 0 ? (
              <p className="text-sm text-slate-500">
                You don&apos;t have any session requests yet.
              </p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Tutor</th>
                      <th className="px-3 py-2">Subject</th>
                      <th className="px-3 py-2">Date &amp; Time</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mySessions.map((s) => (
                      <tr key={s.id} className="border-t text-xs">
                        <td className="px-3 py-2">
                          {tutorNameById(s.tutorId)}
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}