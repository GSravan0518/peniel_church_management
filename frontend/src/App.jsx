import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import PrayerWall from './pages/PrayerWall';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Login from './pages/Login';
import BelieverLogin from './pages/BelieverLogin';
import PastorLogin from './pages/PastorLogin';
import Register from './pages/Register';
import MemberDashboard from './pages/MemberDashboard';
import PastorDashboard from './pages/PastorDashboard';
import './index.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="events" element={<Events />} />
            <Route path="prayer-wall" element={<PrayerWall />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="contact" element={<Contact />} />
            <Route path="login" element={<Login />} />
            <Route path="login/believer" element={<BelieverLogin />} />
            <Route path="login/pastor" element={<PastorLogin />} />
            <Route path="register" element={<Register />} />
            <Route element={<ProtectedRoute roles={['member']} />}>
              <Route path="member-dashboard" element={<MemberDashboard />} />
            </Route>
            <Route element={<ProtectedRoute roles={['pastor', 'admin']} />}>
              <Route path="pastor-dashboard" element={<PastorDashboard />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
