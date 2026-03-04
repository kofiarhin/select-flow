import { Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectPage from "./pages/ProjectPage";
import GalleryPage from "./pages/GalleryPage";
import Home from "./pages/Home/Home";
import Header from "./components/Header/Header";

const App = () => (
  <>
    <Header />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/projects/:id" element={<ProjectPage />} />
      <Route path="/gallery/:clientAccessToken" element={<GalleryPage />} />
    </Routes>
  </>
);

export default App;
