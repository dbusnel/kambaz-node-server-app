import PazzaDao from "./dao.js";
import { v4 as uuidv4 } from "uuid";
export default function PazzaRoutes(app, db) {
  const dao = PazzaDao(db);

  const getAllPosts = (req, res) => {
    const { userId, courseId } = req.params;
    const posts = dao.findPostsForCourse(courseId, userId);
    res.json(posts);
  };

  const getPostById = (req, res) => {
    const { userId, courseId, pid } = req.params;
    const post = dao.findPostById(pid);
    res.json(post);
  };

  const patchDiscussion = (req, res) => {
    const { pid, discussionId } = req.params;
    const { resolved } = req.body;
    const discussion = dao.setDiscussionResolved(pid, discussionId, resolved);
    if (!discussion) return res.status(404).json({ error: "Post or discussion not found" });
    res.json(discussion);
  };

  const addFollowUpDiscussion = (req, res) => {
    const { userId, pid } = req.params;
    const { content } = req.body;
    const discussion = dao.createFollowUpDiscussion(pid, {
      authorId: userId,
      content,
    });
    if (!discussion) return res.status(404).json({ error: "Post not found" });
    res.json(discussion);
  };

  const addReply = (req, res) => {
    const { userId, pid, discussionId } = req.params;
    const { content } = req.body;
    const reply = dao.createReply(pid, discussionId, {
      authorId: userId,
      content,
    });
    if (!reply) return res.status(404).json({ error: "Post or discussion not found" });
    res.json(reply);
  };

  const createPost = (req, res) => {
    const { userId, courseId } = req.params;
    const { summary, type, details, visibility, visibleTo, folderIds } = req.body;
    if (type && type !== "question" && type !== "note") {
      return res.status(400).json({ error: "type must be 'question' or 'note'" });
    }
    const post = dao.createPost({
      courseId,
      type: type || "question",
      visibility: visibility || "entire_class",
      visibleTo: visibleTo || [],
      folderIds: folderIds || [],
      summary,
      details: details || "",
      authorId: userId,
    });
    res.json(post);
  };

  const getFolders = (req, res) => {
    const { courseId } = req.params;
    res.json(db.folders.filter((f) => f.courseId === courseId));
  };

  const createFolder = (req, res) => {
    const { courseId } = req.params;
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: "name is required" });
    const folder = { id: uuidv4(), courseId, name: name.trim() };
    db.folders = [...db.folders, folder];
    res.json(folder);
  };

  const updateFolder = (req, res) => {
    const { folderId } = req.params;
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: "name is required" });
    const folder = db.folders.find((f) => f.id === folderId);
    if (!folder) return res.status(404).json({ error: "Folder not found" });
    folder.name = name.trim();
    res.json(folder);
  };

  const deleteFolder = (req, res) => {
    const { folderId } = req.params;
    const exists = db.folders.some((f) => f.id === folderId);
    if (!exists) return res.status(404).json({ error: "Folder not found" });
    db.folders = db.folders.filter((f) => f.id !== folderId);
    res.json({ deleted: folderId });
  };

  app.get("/api/courses/:courseId/pazza/folders", getFolders);
  app.post("/api/courses/:courseId/pazza/folders", createFolder);
  app.put("/api/courses/:courseId/pazza/folders/:folderId", updateFolder);
  app.delete("/api/courses/:courseId/pazza/folders/:folderId", deleteFolder);
  app.get("/api/users/:userId/courses/:courseId/pazza", getAllPosts);
  app.post("/api/users/:userId/courses/:courseId/pazza", createPost);
  app.get("/api/users/:userId/courses/:courseId/pazza/:pid", getPostById);
  app.patch(
    "/api/users/:userId/courses/:courseId/pazza/:pid/discussions/:discussionId",
    patchDiscussion,
  );
  app.post(
    "/api/users/:userId/courses/:courseId/pazza/:pid/discussions",
    addFollowUpDiscussion,
  );
  app.post(
    "/api/users/:userId/courses/:courseId/pazza/:pid/discussions/:discussionId/replies",
    addReply,
  );
}
