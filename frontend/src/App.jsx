import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import Header from "./components/Header.jsx";
import Home from "./components/Home.jsx";
import AddEditForm from "./components/AddEditForm.jsx";

function NotFound() {
  return (
    <main className="page-shell">
      <section className="empty-state">
        <p className="eyebrow">404</p>
        <h1>We could not find that page.</h1>
        <Link className="button button-primary" to="/">
          Return home
        </Link>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-post" element={<AddEditForm />} />
        <Route path="/update-post/:id" element={<AddEditForm />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
