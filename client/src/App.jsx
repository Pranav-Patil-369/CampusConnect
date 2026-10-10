import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Discover from "./pages/Discover";
import AppLayout from "./components/layout/AppLayout";
import StudentProfile from "./pages/StudentProfile";
import TeamFinder from "./pages/TeamFinder";
import CreateProject from "./pages/CreateProject";
import Projects from "./pages/Projects";
import Invitations from "./pages/Invitations";
import ProjectWorkspace from "./pages/ProjectWorkspace";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="students/:id" element={<StudentProfile />} />
          <Route path="discover" element={<Discover />} />
          <Route path="team-finder" element={<TeamFinder />} />
          <Route path="projects/create" element={<CreateProject />} />
          <Route path="projects" element={<Projects />} />
<Route
  path="projects/create"
  element={<CreateProject />}
/>
<Route
  path="projects/:id"
  element={<ProjectWorkspace />}
/>
          <Route path="invitations" element={<Invitations />} />
          <Route path="projects/:id" element={<ProjectWorkspace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;