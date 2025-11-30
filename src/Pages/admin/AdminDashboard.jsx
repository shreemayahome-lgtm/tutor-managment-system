// src/Pages/admin/AdminDashboard.jsx

import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import LogoutButton from "../../components/LogoutButton.jsx";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);

  const loadData = async () => {
    const userSnap = await getDocs(collection(db, "users"));
    setUsers(userSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

    const sessionSnap = await getDocs(collection(db, "sessions"));
    setSessions(sessionSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleVerify = async (userId, current) => {
    await updateDoc(doc(db, "users", userId), { isVerified: !current });
    loadData(); // refresh UI
  };

  const totalTutors = users.filter((u) => u.role === "TUTOR").length;
  const totalStudents = users.filter((u) => u.role === "STUDENT").length;
  const totalAdmins = users.filter((u) => u.role === "ADMIN").length;

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold text-slate-800">
            Tutor Management System
          </h1>
          <p className="text-sm text-slate-500">Admin Panel</p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Stats */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase text-slate-500">
              Tutors
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-800">
              {totalTutors}
            </p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase text-slate-500">
              Students
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-800">
              {totalStudents}
            </p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase text-slate-500">
              Admins
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-800">
              {totalAdmins}
            </p>
          </div>
        </section>

        {/* Users list */}
        <section className="rounded-xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">
              All Users
            </h2>
            <LogoutButton />
          </div>
          {users.length === 0 ? (
            <p className="text-sm text-slate-500">No users yet.</p>
          ) : (
            <ul className="divide-y divide-slate-200 text-sm">
              {users.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <p className="font-medium text-slate-800">
                      {u.name}{" "}
                      {u.role === "TUTOR" && u.isVerified && (
                        <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          ✅ Verified
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
                      {u.role}
                    </span>

                    {u.role === "TUTOR" && (
                      <button
                        onClick={() =>
                          handleToggleVerify(u.id, !!u.isVerified)
                        }
                        className={
                          "rounded-lg px-2 py-1 text-[11px] font-medium text-white " +
                          (u.isVerified
                            ? "bg-rose-600 hover:bg-rose-700"
                            : "bg-emerald-600 hover:bg-emerald-700")
                        }
                      >
                        {u.isVerified ? "Unverify" : "Verify"}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Sessions */}
        <section className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-slate-800">
            All Sessions
          </h2>
          {sessions.length === 0 ? (
            <p className="text-sm text-slate-500">No sessions yet.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Tutor ID</th>
                    <th className="px-3 py-2">Student ID</th>
                    <th className="px-3 py-2">Subject</th>
                    <th className="px-3 py-2">Date &amp; Time</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id} className="border-t text-xs">
                      <td className="px-3 py-2">{s.tutorId}</td>
                      <td className="px-3 py-2">{s.studentId}</td>
                      <td className="px-3 py-2">{s.subject}</td>
                      <td className="px-3 py-2">{s.sessionDateTime}</td>
                      <td className="px-3 py-2">{s.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}