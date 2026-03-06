import { Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectPage from "./pages/ProjectPage";
import GalleryPage from "./pages/GalleryPage";
import Home from "./pages/Home/Home";
import Header from "./components/Header/Header";
import RequireAuth from "./components/auth/RequireAuth";
import PublicOnly from "./components/auth/PublicOnly";

const App = () => (
  <>
    <Header />
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/login"
        element={
          <PublicOnly>
            <LoginPage />
          </PublicOnly>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnly>
            <RegisterPage />
          </PublicOnly>
        }
      />

      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <RequireAuth>
            <ProjectPage />
          </RequireAuth>
        }
      />

      <Route path="/gallery/:clientAccessToken" element={<GalleryPage />} />
    </Routes>
  </>
);

export default App;
