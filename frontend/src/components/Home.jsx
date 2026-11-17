import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Post from "./Post.jsx";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1").replace(/\/+$/, "");

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [location, setLocation] = useState(null);
  const [locationMessage, setLocationMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadPosts() {
      try {
        const response = await fetch(`${API_URL}/posts`, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Could not load posts.");
        }
        setPosts(data);
        setError("");
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "Could not connect to the blog API.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadPosts();
    return () => controller.abort();
  }, []);

  async function deletePost(id) {
    if (!window.confirm("Delete this post? This cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/posts/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Could not delete the post.");
      }
      setPosts((currentPosts) => currentPosts.filter((post) => post._id !== id));
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Could not delete the post.");
    }
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationMessage("Location is not available in this browser.");
      return;
    }

    setLocationMessage("Waiting for location permission…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation({ latitude: coords.latitude, longitude: coords.longitude });
        setLocationMessage("");
      },
      (geoError) => {
        setLocation(null);
        setLocationMessage(
          geoError.code === geoError.PERMISSION_DENIED
            ? "Location permission was denied. You can still use the blog normally."
            : "Could not get your location. You can still use the blog normally.",
        );
      },
    );
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">A LITTLE SPACE FOR BIG IDEAS</p>
          <h1>Welcome to my blog</h1>
          <p className="hero-description">
            Notes, stories, and things worth sharing. Make yourself at home.
          </p>
          <Link className="button button-primary" to="/create-post">
            Write a post <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="hero-art" aria-hidden="true">
          <span className="art-sun" />
          <span className="art-page art-page-back" />
          <span className="art-page art-page-front">
            <i />
            <i />
            <i />
          </span>
          <span className="art-sparkle">✳</span>
        </div>
      </section>

      <section className="posts-section" aria-labelledby="posts-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE LATEST</p>
            <h2 id="posts-heading">From the blog</h2>
          </div>
          <button className="button button-light location-button" onClick={requestLocation} type="button">
            <span aria-hidden="true">◎</span> Allow Location
          </button>
        </div>

        {location && (
          <p className="location-result" role="status">
            Your location: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
          </p>
        )}
        {locationMessage && (
          <p className="location-message" role="status">
            {locationMessage}
          </p>
        )}
        {error && (
          <p className="alert" role="alert">
            {error}
          </p>
        )}
        {loading ? (
          <p className="status-message" role="status">
            Loading posts…
          </p>
        ) : posts.length ? (
          <div className="post-grid">
            {posts.map((post) => (
              <Post key={post._id} post={post} onDelete={deletePost} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">
              ✎
            </span>
            <h3>No posts yet</h3>
            <p>Your first story is just a few words away.</p>
            <Link className="button button-primary" to="/create-post">
              Create your first post
            </Link>
          </div>
        )}
      </section>
      <footer className="site-footer">Made with care · VVIT Experiment 25</footer>
    </main>
  );
}
