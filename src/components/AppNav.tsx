import { NavLink } from 'react-router-dom';

export const AppNav = () => {
  return (
    <nav className="app-nav">
      <NavLink to="/" end className={({ isActive }) => `app-nav-link${isActive ? ' active' : ''}`}>
        Account
      </NavLink>
      <NavLink to="/constructor" className={({ isActive }) => `app-nav-link${isActive ? ' active' : ''}`}>
        Constructor
      </NavLink>
    </nav>
  );
};
