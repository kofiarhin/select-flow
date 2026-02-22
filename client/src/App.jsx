import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectPage from './pages/ProjectPage';
import GalleryPage from './pages/GalleryPage';

const App = () => (
  <Routes>
    <Route path='/' element={<Navigate to='/dashboard' />} />
    <Route path='/login' element={<LoginPage />} />
    <Route path='/register' element={<RegisterPage />} />
    <Route path='/dashboard' element={<DashboardPage />} />
    <Route path='/projects/:id' element={<ProjectPage />} />
    <Route path='/gallery/:clientAccessToken' element={<GalleryPage />} />
  </Routes>
);

export default App;
