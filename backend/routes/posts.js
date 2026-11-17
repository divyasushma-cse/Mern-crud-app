import { Router } from "express";

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function validatePostInput(body) {
  const { title, content } = body ?? {};

  if (typeof title !== "string" || !title.trim()) {
    return "A non-empty title is required.";
  }

  if (typeof content !== "string" || !content.trim()) {
    return "Non-empty content is required.";
  }

  return null;
}

function validateId(req, res, next) {
  const isUuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(req.params.id);
  if (!isUuid) {
    return res.status(400).json({ message: "Post ID must be a valid UUID." });
  }

  return next();
}

async function runDatabaseQuery(query) {
  try {
    return await query();
  } catch (error) {
    const isPostgresError =
      typeof error?.code === "string" && /^[0-9A-Z]{5}$/.test(error.code);
    const databaseError = new Error(
      isPostgresError ? "A database query failed." : "The database is currently unavailable.",
    );
    databaseError.statusCode = isPostgresError ? 500 : 503;

    if (isPostgresError) {
      console.error("Neon query failed with SQLSTATE:", error.code);
    } else {
      console.error("Neon database request failed.");
    }

    throw databaseError;
  }
}

export function createPostsRouter(sql) {
  const router = Router();

  router.post(
    "/",
    asyncHandler(async (req, res) => {
      const validationMessage = validatePostInput(req.body);
      if (validationMessage) {
        return res.status(400).json({ message: validationMessage });
      }

      const [post] = await runDatabaseQuery(
        () => sql`
          INSERT INTO posts (title, content)
          VALUES (${req.body.title.trim()}, ${req.body.content.trim()})
          RETURNING id AS "_id", title, content, created_at AS "createdAt", updated_at AS "updatedAt"
        `,
      );

      return res.status(201).json(post);
    }),
  );

  router.get(
    "/",
    asyncHandler(async (_req, res) => {
      const posts = await runDatabaseQuery(
        () => sql`
          SELECT id AS "_id", title, content, created_at AS "createdAt", updated_at AS "updatedAt"
          FROM posts
          ORDER BY created_at DESC
        `,
      );

      return res.status(200).json(posts);
    }),
  );

  router.get(
    "/:id",
    validateId,
    asyncHandler(async (req, res) => {
      const [post] = await runDatabaseQuery(
        () => sql`
          SELECT id AS "_id", title, content, created_at AS "createdAt", updated_at AS "updatedAt"
          FROM posts
          WHERE id = ${req.params.id}::uuid
        `,
      );

      if (!post) {
        return res.status(404).json({ message: "Post not found." });
      }

      return res.status(200).json(post);
    }),
  );

  router.put(
    "/:id",
    validateId,
    asyncHandler(async (req, res) => {
      const validationMessage = validatePostInput(req.body);
      if (validationMessage) {
        return res.status(400).json({ message: validationMessage });
      }

      const [post] = await runDatabaseQuery(
        () => sql`
          UPDATE posts
          SET title = ${req.body.title.trim()},
              content = ${req.body.content.trim()},
              updated_at = now()
          WHERE id = ${req.params.id}::uuid
          RETURNING id AS "_id", title, content, created_at AS "createdAt", updated_at AS "updatedAt"
        `,
      );

      if (!post) {
        return res.status(404).json({ message: "Post not found." });
      }

      return res.status(200).json(post);
    }),
  );

  router.delete(
    "/:id",
    validateId,
    asyncHandler(async (req, res) => {
      const [post] = await runDatabaseQuery(
        () => sql`
          DELETE FROM posts
          WHERE id = ${req.params.id}::uuid
          RETURNING id
        `,
      );

      if (!post) {
        return res.status(404).json({ message: "Post not found." });
      }

      return res.status(200).json({ message: "Post deleted successfully." });
    }),
  );

  return router;
}
