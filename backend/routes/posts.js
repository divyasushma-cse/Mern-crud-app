import { Router } from "express";
import mongoose from "mongoose";
import Post from "../models/Post.js";

const router = Router();

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
  if (!mongoose.isObjectIdOrHexString(req.params.id)) {
    return res.status(400).json({ message: "Post ID must be a valid MongoDB ObjectId." });
  }

  return next();
}

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const validationMessage = validatePostInput(req.body);
    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    const post = await Post.create({
      title: req.body.title.trim(),
      content: req.body.content.trim(),
    });

    return res.status(201).json(post);
  }),
);

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const posts = await Post.find().sort({ createdAt: -1 });
    return res.status(200).json(posts);
  }),
);

router.get(
  "/:id",
  validateId,
  asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
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

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    post.title = req.body.title.trim();
    post.content = req.body.content.trim();
    await post.save();

    return res.status(200).json(post);
  }),
);

router.delete(
  "/:id",
  validateId,
  asyncHandler(async (req, res) => {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    return res.status(200).json({ message: "Post deleted successfully." });
  }),
);

export default router;
