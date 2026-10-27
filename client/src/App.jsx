import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import StudentDashboard from "./pages/StudentDashboard";
import Auth from "./pages/Auth";
import EventDetails from "./pages/EventDetails";
import MyEvents from "./pages/MyEvents";
import { ManageEvents, EventForm, AdminPage } from "./pages/ManageEvents";

export default function App() {
  const { user, loading } = useAuth();
  return <div className="app-shell">{user && <Navbar/>}<Routes>
    <Route path="/" element={loading ? <div className="page-loader">Loading ClubSphere…</div> : user ? <Home/> : <Navigate to="/login" replace/>}/>
    <Route path="/student" element={<ProtectedRoute roles={["student"]}><StudentDashboard/></ProtectedRoute>}/>
    <Route path="/login" element={loading ? <div className="page-loader">Loading ClubSphere…</div> : user ? <Navigate to="/" replace/> : <Auth mode="login"/>}/>
    <Route path="/register" element={loading ? <div className="page-loader">Loading ClubSphere…</div> : user ? <Navigate to="/" replace/> : <Auth mode="register"/>}/>
    <Route path="/events/:id" element={<EventDetails/>}/>
    <Route path="/my-events" element={<ProtectedRoute roles={["student"]}><MyEvents/></ProtectedRoute>}/>
    <Route path="/manage" element={<ProtectedRoute roles={["organizer","admin"]}><ManageEvents/></ProtectedRoute>}/>
    <Route path="/organizer" element={<ProtectedRoute roles={["organizer"]}><ManageEvents/></ProtectedRoute>}/>
    <Route path="/manage/new" element={<ProtectedRoute roles={["organizer","admin"]}><EventForm/></ProtectedRoute>}/>
    <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminPage/></ProtectedRoute>}/>
    <Route path="*" element={<main className="content-page"><h1>Page not found</h1><a href="/">Explore events</a></main>}/>
  </Routes></div>;
}
