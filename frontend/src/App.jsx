import { Routes, Route, NavLink } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import TicketsPage from "./pages/TicketsPage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="bg-white border-b shadow-sm px-6 py-3 flex items-center justify-between">
        <NavLink to="/" className="text-xl font-semibold text-blue-600">
          OpsLog
        </NavLink>

        <div className="space-x-6">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `hover:text-blue-600 ${
                isActive ? "text-blue-600 font-medium" : "text-gray-700"
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/tickets"
            className={({ isActive }) =>
              `hover:text-blue-600 ${
                isActive ? "text-blue-600 font-medium" : "text-gray-700"
              }`
            }
          >
            Tickets
          </NavLink>
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `hover:text-blue-600 ${
                isActive ? "text-blue-600 font-medium" : "text-gray-700"
              }`
            }
          >
            Login
          </NavLink>
        </div>
      </nav>

      <main className="p-8">
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets"
            element={
              <ProtectedRoute>
                <TicketsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<LoginPage />} />
        </Routes>
      </main>
    </div>
  );
}