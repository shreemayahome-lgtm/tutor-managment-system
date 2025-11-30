import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import AdminDashboard from "./Pages/admin/AdminDashboard.jsx";
import TutorDashboard from "./Pages/tutor/TutorDashboard.jsx";
import StudentDashboard from "./Pages/student/StudentDashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (


        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tutor"
            element={
              <ProtectedRoute allowedRoles={["TUTOR"]}>
                <TutorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* default route */}
          <Route path="*" element={<Login />} />
        </Routes>


  );
}

export default App;