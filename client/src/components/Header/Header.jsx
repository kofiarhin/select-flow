import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import "./header.styles.scss";

const Header = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isClientGallery = useMemo(() => {
    // hides nav on client gallery route (optional)
    return location.pathname.startsWith("/gallery/");
  }, [location.pathname]);

  useEffect(() => {
    // close menu on route change
    setOpen(false);
  }, [location.pathname]);

  if (isClientGallery) return null;

  return (
    <header className="nav">
      <div className="nav__inner">
        <NavLink to="/" className="nav__brand" aria-label="SelectFlow Home">
          SelectFlow
        </NavLink>

        <button
          className="nav__toggle"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="nav__bar" />
          <span className="nav__bar" />
          <span className="nav__bar" />
        </button>

        <nav className={`nav__menu ${open ? "nav__menu--open" : ""}`}>
          <NavLink
            to="/"
            className={({ isActive }) =>
              `nav__link ${isActive ? "nav__link--active" : ""}`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `nav__link ${isActive ? "nav__link--active" : ""}`
            }
          >
            Dashboard
          </NavLink>

          <div className="nav__spacer" />

          <NavLink
            to="/login"
            className={({ isActive }) =>
              `nav__link nav__link--ghost ${isActive ? "nav__link--active" : ""}`
            }
          >
            Login
          </NavLink>

          <NavLink
            to="/register"
            className={({ isActive }) =>
              `nav__link nav__link--primary ${
                isActive ? "nav__link--active" : ""
              }`
            }
          >
            Sign up
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Header;
