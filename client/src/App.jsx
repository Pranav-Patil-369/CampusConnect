import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Discover from "./pages/Discover";
import StudentProfile from "./pages/StudentProfile";
import TeamFinder from "./pages/TeamFinder";
import CreateProject from "./pages/CreateProject";
import Projects from "./pages/Projects";
import Invitations from "./pages/Invitations";
import ProjectWorkspace from "./pages/ProjectWorkspace";
import Opportunities from "./pages/Opportunities";
import OpportunityDetails from "./pages/OpportunityDetails";
import Settings from "./pages/Settings";

import AppLayout from "./components/layout/AppLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route index element={<Dashboard />} />

          {/* Profile */}
          <Route path="profile" element={<Profile />} />

          {/* Discover */}
          <Route path="discover" element={<Discover />} />

          {/* Public Student Profile */}
          <Route path="students/:id" element={<StudentProfile />} />

          {/* Team Finder */}
          <Route path="team-finder" element={<TeamFinder />} />

          {/* Projects */}
          <Route path="projects" element={<Projects />} />

          <Route path="projects/create" element={<CreateProject />} />

          <Route path="projects/:id" element={<ProjectWorkspace />} />

          {/* Invitations */}
          <Route path="invitations" element={<Invitations />} />

          {/* Opportunities */}
          <Route path="opportunities" element={<Opportunities />} />

          <Route
            path="opportunities/:id"
            element={<OpportunityDetails />}
          />
        </Route>

        {/* Protected Settings Route */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Settings />} />
        </Route>

        {/* Optional: Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;