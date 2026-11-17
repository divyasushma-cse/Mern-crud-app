import { Link, NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" to="/" aria-label="My Blog home">
          <span className="brand-mark" aria-hidden="true">
            b.
          </span>
          <span>my blog</span>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          <NavLink to="/" end>
            Home
          </NavLink>
          <Link className="button button-primary nav-create" to="/create-post">
            <span aria-hidden="true">+</span> Create Post
          </Link>
        </nav>
      </div>
    </header>
  );
}
