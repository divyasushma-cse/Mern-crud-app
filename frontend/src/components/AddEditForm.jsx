import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1").replace(/\/+$/, "");

export default function AddEditForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();

    async function loadPost() {
      try {
        const response = await fetch(`${API_URL}/posts/${id}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Could not load this post.");
        }
        setTitle(data.title);
        setContent(data.content);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "Could not load this post.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadPost();
    return () => controller.abort();
  }, [id]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/posts${id ? `/${id}` : ""}`, {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Could not save your post.");
      }
      navigate("/");
    } catch (requestError) {
      setError(requestError.message || "Could not save your post.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="page-shell form-shell">
        <p className="status-message" role="status">
          Loading post…
        </p>
      </main>
    );
  }

  return (
    <main className="page-shell form-shell">
      <Link className="back-link" to="/">
        <span aria-hidden="true">←</span> Back to all posts
      </Link>
      <section className="form-card">
        <p className="eyebrow">{id ? "MAKE IT JUST RIGHT" : "START SOMETHING NEW"}</p>
        <h1>{id ? "Edit your post" : "Create a post"}</h1>
        <p className="form-intro">
          {id ? "Update the title or story below." : "Put your thoughts into words and share them."}
        </p>

        {error && (
          <p className="alert" role="alert">
            {error}
          </p>
        )}

        <form className="post-form" onSubmit={handleSubmit}>
          <label htmlFor="post-title">Title</label>
          <input
            id="post-title"
            name="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Give your post a title"
            required
            maxLength={200}
          />

          <label htmlFor="post-content">Content</label>
          <textarea
            id="post-content"
            name="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="What's on your mind?"
            rows={9}
            required
          />

          <div className="form-actions">
            <Link className="button button-light" to="/">
              Cancel
            </Link>
            <button className="button button-primary" disabled={saving} type="submit">
              {saving ? "Saving…" : id ? "Save changes" : "Publish post"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
