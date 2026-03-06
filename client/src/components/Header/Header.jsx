import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faXmark,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import useMe from "../../hooks/useMe";
import "./header.styles.scss";

const Header = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: me } = useMe();
  const isAuthed = !!me && !!localStorage.getItem("token");

  const isClientGallery = useMemo(() => {
    return location.pathname.startsWith("/gallery/");
  }, [location.pathname]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("token");
    qc.removeQueries({ queryKey: ["me"] });
    setOpen(false);
    navigate("/login");
  };

  const desktopLinks = isAuthed
    ? [
        { to: "/", label: "Home" },
        { to: "/dashboard", label: "Dashboard" },
      ]
    : [{ to: "/", label: "Home" }];

  const mobileLinks = desktopLinks;

  if (isClientGallery) return null;

  return (
    <header className="nav">
      <div className="nav__inner">
        <NavLink to="/" className="nav__brand" aria-label="SelectFlow Home">
          SelectFlow
        </NavLink>

        {/* Mobile toggle */}
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
          {desktopLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `nav__link ${isActive ? "nav__link--active" : ""}`
              }
            >
              {l.label}
            </NavLink>
          ))}

          <div className="nav__spacer" />

          {!isAuthed ? (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `nav__link nav__link--ghost ${
                    isActive ? "nav__link--active" : ""
                  }`
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
            </>
          ) : (
            <button
              className="nav__link nav__link--ghost nav__logout"
              type="button"
              onClick={logout}
            >
              <span className="nav__logoutText">Logout</span>
              <FontAwesomeIcon
                className="nav__logoutIcon"
                icon={faRightFromBracket}
              />
            </button>
          )}
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
          {mobileLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `sidenav__link ${isActive ? "sidenav__link--active" : ""}`
              }
            >
              {l.label}
            </NavLink>
          ))}

          <div className="sidenav__divider" />

          {!isAuthed ? (
            <>
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
            </>
          ) : (
            <button
              className="sidenav__link sidenav__logout"
              type="button"
              onClick={logout}
            >
              <span>Logout</span>
              <FontAwesomeIcon
                className="sidenav__logoutIcon"
                icon={faRightFromBracket}
              />
            </button>
          )}
        </nav>
      </aside>
    </header>
  );
};

export default Header;
