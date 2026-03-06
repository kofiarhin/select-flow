import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import "./header.styles.scss";

const Header = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isClientGallery = useMemo(() => {
    return location.pathname.startsWith("/gallery/");
  }, [location.pathname]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  if (isClientGallery) return null;

  return (
    <header className="nav">
      <div className="nav__inner">
        <NavLink to="/" className="nav__brand" aria-label="SelectFlow Home">
          SelectFlow
        </NavLink>

        {/* Mobile toggle (FontAwesomeIcon) */}
        <button
          className="nav__iconBtn"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <FontAwesomeIcon icon={open ? faXmark : faBars} />
        </button>

        {/* Desktop nav */}
        <nav className="nav__menu nav__menu--desktop" aria-label="Main">
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

      {/* Backdrop */}
      <div
        className={`nav__backdrop ${open ? "nav__backdrop--show" : ""}`}
        onClick={() => setOpen(false)}
      />

      {/* Mobile side nav */}
      <aside className={`sidenav ${open ? "sidenav--open" : ""}`}>
        <div className="sidenav__top">
          <span className="sidenav__brand">SelectFlow</span>

          <button
            className="sidenav__close"
            type="button"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <nav className="sidenav__links" aria-label="Mobile">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `sidenav__link ${isActive ? "sidenav__link--active" : ""}`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `sidenav__link ${isActive ? "sidenav__link--active" : ""}`
            }
          >
            Dashboard
          </NavLink>

          <div className="sidenav__divider" />

          <NavLink
            to="/login"
            className={({ isActive }) =>
              `sidenav__link ${isActive ? "sidenav__link--active" : ""}`
            }
          >
            Login
          </NavLink>

          <NavLink
            to="/register"
            className={({ isActive }) =>
              `sidenav__link sidenav__link--primary ${
                isActive ? "sidenav__link--active" : ""
              }`
            }
          >
            Sign up
          </NavLink>
        </nav>
      </aside>
    </header>
  );
};

export default Header;
