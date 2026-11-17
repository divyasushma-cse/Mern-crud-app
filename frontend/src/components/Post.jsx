import { Link } from "react-router-dom";

export default function Post({ post, onDelete }) {
  return (
    <article className="post-card">
      <div className="post-card-top">
        <span className="post-label">BLOG POST</span>
        <span className="post-date">
          {post.createdAt
            ? new Date(post.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : ""}
        </span>
      </div>
      <h2>{post.title}</h2>
      <p className="post-content">{post.content}</p>
      <div className="post-actions">
        <Link className="button button-light" to={`/update-post/${post._id}`}>
          Edit
        </Link>
        <button className="button button-danger" onClick={() => onDelete(post._id)} type="button">
          Delete
        </button>
      </div>
    </article>
  );
}
