import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import express from "express";
import { test } from "node:test";
import { createPostsRouter } from "./posts.js";

function createMemorySql() {
  const posts = new Map();

  return async (parts, ...values) => {
    const statement = parts.join(" ").replace(/\s+/g, " ").trim().toLowerCase();

    if (statement.startsWith("insert into posts")) {
      const now = new Date().toISOString();
      const post = {
        _id: randomUUID(),
        title: values[0],
        content: values[1],
        createdAt: now,
        updatedAt: now,
      };
      posts.set(post._id, post);
      return [{ ...post }];
    }

    if (statement.startsWith("select")) {
      if (statement.includes("where id =")) {
        const post = posts.get(values[0]);
        return post ? [{ ...post }] : [];
      }

      return [...posts.values()].map((post) => ({ ...post }));
    }

    if (statement.startsWith("update posts")) {
      const [title, content, id] = values;
      const post = posts.get(id);
      if (!post) {
        return [];
      }

      post.title = title;
      post.content = content;
      post.updatedAt = new Date().toISOString();
      return [{ ...post }];
    }

    if (statement.startsWith("delete from posts")) {
      const [id] = values;
      return posts.delete(id) ? [{ id }] : [];
    }

    throw new Error(`Unexpected SQL in test: ${statement}`);
  };
}

test("posts API supports CRUD and validates inputs", async () => {
  const app = express();
  app.use(express.json());
  app.use("/api/v1/posts", createPostsRouter(createMemorySql()));
  app.use((err, _req, res, _next) => {
    res.status(err.statusCode || 500).json({ message: err.message });
  });

  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address();
  const url = `http://127.0.0.1:${port}/api/v1/posts`;

  try {
    const invalidPost = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: " ", content: "content" }),
    });
    assert.equal(invalidPost.status, 400);

    const invalidId = await fetch(`${url}/not-a-uuid`);
    assert.equal(invalidId.status, 400);

    const createResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Test post", content: "Test content" }),
    });
    assert.equal(createResponse.status, 201);
    const createdPost = await createResponse.json();
    assert.match(createdPost._id, /^[0-9a-f-]{36}$/i);

    const listResponse = await fetch(url);
    assert.equal(listResponse.status, 200);
    assert.equal((await listResponse.json())[0]._id, createdPost._id);

    const getResponse = await fetch(`${url}/${createdPost._id}`);
    assert.equal(getResponse.status, 200);
    assert.equal((await getResponse.json()).title, "Test post");

    const updateResponse = await fetch(`${url}/${createdPost._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Updated post", content: "Updated content" }),
    });
    assert.equal(updateResponse.status, 200);
    assert.equal((await updateResponse.json()).title, "Updated post");

    const deleteResponse = await fetch(`${url}/${createdPost._id}`, { method: "DELETE" });
    assert.equal(deleteResponse.status, 200);

    const missingResponse = await fetch(`${url}/${createdPost._id}`);
    assert.equal(missingResponse.status, 404);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});
