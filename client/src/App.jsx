import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import AppLayout from "./components/layout/AppLayout";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";



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
</Route>          
</Routes>
        </BrowserRouter>
    );
}

export default App;