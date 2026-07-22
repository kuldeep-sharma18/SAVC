import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { INITIAL_VIDEOS } from "./src/data/videosData.js";

// In-memory data store for live updates
let videosStore = JSON.parse(JSON.stringify(INITIAL_VIDEOS));
// Set of user likes keyed by videoId:userIp or videoId:session
const userLikesSet = new Set();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes & Endpoint handlers

  // 1. GET /videos & GET /api/videos - Return video metadata
  const handleGetVideos = (req, res) => {
    const { category, search } = req.query;
    let filtered = [...videosStore];

    if (category && typeof category === "string" && category !== "All") {
      filtered = filtered.filter(
        (v) => v.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (search && typeof search === "string" && search.trim() !== "") {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.description.toLowerCase().includes(q) ||
          v.tags.some((t) => t.toLowerCase().includes(q)) ||
          v.author.name.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      totalCount: filtered.length,
      videos: filtered,
    });
  };

  app.get("/videos", handleGetVideos);
  app.get("/api/videos", handleGetVideos);

  // 2. POST /like & POST /api/like - Receive video ID and user/IP. Store or update like count.
  const handlePostLike = (req, res) => {
    const videoId = req.body?.videoId || req.body?.id;
    const userIp = req.body?.userIp || req.body?.user || req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";

    if (!videoId) {
      return res.status(400).json({ success: false, error: "videoId is required" });
    }

    const video = videosStore.find((v) => v.id === videoId);
    if (!video) {
      return res.status(404).json({ success: false, error: "Video not found" });
    }

    const likeKey = `${videoId}:${userIp}`;
    let userLiked = false;

    if (userLikesSet.has(likeKey)) {
      // Toggle unlike
      userLikesSet.delete(likeKey);
      video.likesCount = Math.max(0, video.likesCount - 1);
      video.userLiked = false;
      userLiked = false;
    } else {
      // Toggle like
      userLikesSet.add(likeKey);
      video.likesCount += 1;
      video.userLiked = true;
      userLiked = true;
    }

    res.json({
      success: true,
      videoId: video.id,
      likesCount: video.likesCount,
      userLiked: userLiked,
      userIp,
    });
  };

  app.post("/like", handlePostLike);
  app.post("/api/like", handlePostLike);

  // 3. POST /share & POST /api/share - Track shares with video ID and platform info
  const handlePostShare = (req, res) => {
    const videoId = req.body?.videoId || req.body?.id;
    const platform = req.body?.platform || req.body?.platformInfo || "copy_link";

    if (!videoId) {
      return res.status(400).json({ success: false, error: "videoId is required" });
    }

    const video = videosStore.find((v) => v.id === videoId);
    if (!video) {
      return res.status(404).json({ success: false, error: "Video not found" });
    }

    video.sharesCount += 1;

    console.log(`[SHARE TRACKED] Video ${videoId} shared on platform: ${platform}. Total: ${video.sharesCount}`);

    res.json({
      success: true,
      videoId: video.id,
      sharesCount: video.sharesCount,
      platform,
    });
  };

  app.post("/share", handlePostShare);
  app.post("/api/share", handlePostShare);

  // 4. POST /api/comment - Add comment for video ID
  app.post("/api/comment", (req, res) => {
    const { videoId, author = "Guest User", text } = req.body || {};

    if (!videoId || !text || !text.trim()) {
      return res.status(400).json({ success: false, error: "videoId and non-empty text are required" });
    }

    const video = videosStore.find((v) => v.id === videoId);
    if (!video) {
      return res.status(404).json({ success: false, error: "Video not found" });
    }

    const newComment = {
      id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      author: author && author !== "Guest User" && author !== "You" ? author.trim() : "John",
      avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyh9ZR7j2Oi5JHGSIe2mt2cgeVlwQb4mXg3kXIaPgEJQ&s=10",
      text: text.trim(),
      timestamp: "Just now",
      likes: 0,
    };

    video.comments.unshift(newComment);
    video.commentsCount = video.comments.length;

    res.json({
      success: true,
      videoId: video.id,
      comment: newComment,
      commentsCount: video.commentsCount,
    });
  });

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", videosLoaded: videosStore.length });
  });

  // Integrate Vite for development / static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      plugins: [],
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
