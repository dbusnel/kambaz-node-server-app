import PazzaDao from "./dao.js";

export default function PazzaRoutes(app) {
  const dao = PazzaDao();

  // ─── Helper: resolve "current" userId from session ────────────────────────
  function resolveUserId(req) {
    const { userId } = req.params;
    if (userId === "current") {
      return req.session["currentUser"]?._id ?? null;
    }
    return userId;
  }

  // ─── Posts ─────────────────────────────────────────────────────────────────

  const getAllPosts = async (req, res) => {
    const userId = resolveUserId(req);
    const { courseId } = req.params;
    const posts = await dao.findPostsForCourse(courseId, userId);
    res.json(posts);
  };

  const getPostById = async (req, res) => {
    const userId = resolveUserId(req);
    const { pid } = req.params;
    const post = await dao.findPostById(pid, userId);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  };

  const createPost = async (req, res) => {
    const userId = resolveUserId(req);
    const { courseId } = req.params;
    const { summary, type, details, visibility, visibleTo, folderIds } = req.body;
    if (!summary?.trim())
      return res.status(400).json({ error: "summary is required" });
    if (summary.trim().length > 100)
      return res.status(400).json({ error: "summary must be 100 characters or fewer" });
    if (type && type !== "question" && type !== "note")
      return res.status(400).json({ error: "type must be 'question' or 'note'" });
    const post = await dao.createPost({
      courseId,
      type: type || "question",
      visibility: visibility || "entire_class",
      visibleTo: visibleTo || [],
      folderIds: folderIds || [],
      summary: summary.trim(),
      details: details || "",
      authorId: userId,
    });
    res.json(post);
  };

  const updatePost = async (req, res) => {
    const userId = resolveUserId(req);
    const { pid } = req.params;
    const { summary, details } = req.body;
    const user = await dao.findUserById(userId);
    const post = await dao.findPostById(pid);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (!dao.isInstructor(user) && post.authorId !== userId)
      return res.status(403).json({ error: "Forbidden" });
    if (summary !== undefined && summary.trim().length > 100)
      return res.status(400).json({ error: "summary must be 100 characters or fewer" });
    const updated = await dao.updatePost(pid, { summary, details });
    res.json(updated);
  };

  const deletePost = async (req, res) => {
    const userId = resolveUserId(req);
    const { pid } = req.params;
    const user = await dao.findUserById(userId);
    const post = await dao.findPostById(pid);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (!dao.isInstructor(user) && post.authorId !== userId)
      return res.status(403).json({ error: "Forbidden" });
    await dao.deletePost(pid);
    res.json({ deleted: pid });
  };

  const incrementViewCount = async (req, res) => {
    const { pid } = req.params;
    const post = await dao.incrementViewCount(pid);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json({ viewCount: post.viewCount });
  };

  // ─── Student Answers ────────────────────────────────────────────────────────

  const createStudentAnswer = async (req, res) => {
    const userId = resolveUserId(req);
    const { pid } = req.params;
    const { content } = req.body;
    const user = await dao.findUserById(userId);
    if (dao.isInstructor(user))
      return res.status(403).json({ error: "Instructors cannot post student answers" });
    const post = await dao.findPostById(pid);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.studentAnswers.length > 0)
      return res.status(400).json({ error: "Student answer already exists" });
    const answer = await dao.createStudentAnswer(pid, { authorId: userId, content });
    res.json(answer);
  };

  const updateStudentAnswer = async (req, res) => {
    const userId = resolveUserId(req);
    const { pid, answerId } = req.params;
    const { content } = req.body;
    const user = await dao.findUserById(userId);
    const post = await dao.findPostById(pid);
    if (!post) return res.status(404).json({ error: "Post not found" });
    const answer = post.studentAnswers.find((a) => a.id === answerId);
    if (!answer) return res.status(404).json({ error: "Answer not found" });
    if (!dao.isInstructor(user) && answer.authorId !== userId)
      return res.status(403).json({ error: "Forbidden" });
    const updated = await dao.updateStudentAnswer(pid, answerId, { content });
    res.json(updated);
  };

  const deleteStudentAnswer = async (req, res) => {
    const userId = resolveUserId(req);
    const { pid, answerId } = req.params;
    const user = await dao.findUserById(userId);
    const post = await dao.findPostById(pid);
    if (!post) return res.status(404).json({ error: "Post not found" });
    const answer = post.studentAnswers.find((a) => a.id === answerId);
    if (!answer) return res.status(404).json({ error: "Answer not found" });
    if (!dao.isInstructor(user) && answer.authorId !== userId)
      return res.status(403).json({ error: "Forbidden" });
    res.json(await dao.deleteStudentAnswer(pid, answerId));
  };

  // ─── Instructor Answers ─────────────────────────────────────────────────────

  const createInstructorAnswer = async (req, res) => {
    const userId = resolveUserId(req);
    const { pid } = req.params;
    const { content } = req.body;
    const user = await dao.findUserById(userId);
    if (!dao.isInstructor(user))
      return res.status(403).json({ error: "Only instructors can post instructor answers" });
    const post = await dao.findPostById(pid);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.instructorAnswers.length > 0)
      return res.status(400).json({ error: "Instructor answer already exists" });
    const answer = await dao.createInstructorAnswer(pid, { authorId: userId, content });
    res.json(answer);
  };

  const updateInstructorAnswer = async (req, res) => {
    const userId = resolveUserId(req);
    const { pid, answerId } = req.params;
    const { content } = req.body;
    const user = await dao.findUserById(userId);
    if (!dao.isInstructor(user))
      return res.status(403).json({ error: "Forbidden" });
    const post = await dao.findPostById(pid);
    if (!post) return res.status(404).json({ error: "Post not found" });
    const answer = post.instructorAnswers.find((a) => a.id === answerId);
    if (!answer) return res.status(404).json({ error: "Answer not found" });
    const updated = await dao.updateInstructorAnswer(pid, answerId, { content });
    res.json(updated);
  };

  const deleteInstructorAnswer = async (req, res) => {
    const userId = resolveUserId(req);
    const { pid, answerId } = req.params;
    const user = await dao.findUserById(userId);
    if (!dao.isInstructor(user))
      return res.status(403).json({ error: "Forbidden" });
    const post = await dao.findPostById(pid);
    if (!post) return res.status(404).json({ error: "Post not found" });
    const answer = post.instructorAnswers.find((a) => a.id === answerId);
    if (!answer) return res.status(404).json({ error: "Answer not found" });
    res.json(await dao.deleteInstructorAnswer(pid, answerId));
  };

  // ─── Follow-up Discussions ──────────────────────────────────────────────────

  const addFollowUpDiscussion = async (req, res) => {
    const userId = resolveUserId(req);
    const { pid } = req.params;
    const { content } = req.body;
    const discussion = await dao.createFollowUpDiscussion(pid, { authorId: userId, content });
    if (!discussion) return res.status(404).json({ error: "Post not found" });
    res.json(discussion);
  };

  const updateDiscussion = async (req, res) => {
    const userId = resolveUserId(req);
    const { pid, discussionId } = req.params;
    const { content } = req.body;
    const user = await dao.findUserById(userId);
    const post = await dao.findPostById(pid);
    if (!post) return res.status(404).json({ error: "Post not found" });
    const discussion = post.followUpDiscussions.find((d) => d.id === discussionId);
    if (!discussion) return res.status(404).json({ error: "Discussion not found" });
    if (!dao.isInstructor(user) && discussion.authorId !== userId)
      return res.status(403).json({ error: "Forbidden" });
    const updated = await dao.updateFollowUpDiscussion(pid, discussionId, { content });
    res.json(updated);
  };

  const deleteDiscussion = async (req, res) => {
    const userId = resolveUserId(req);
    const { pid, discussionId } = req.params;
    const user = await dao.findUserById(userId);
    const post = await dao.findPostById(pid);
    if (!post) return res.status(404).json({ error: "Post not found" });
    const discussion = post.followUpDiscussions.find((d) => d.id === discussionId);
    if (!discussion) return res.status(404).json({ error: "Discussion not found" });
    if (!dao.isInstructor(user) && discussion.authorId !== userId)
      return res.status(403).json({ error: "Forbidden" });
    res.json(await dao.deleteFollowUpDiscussion(pid, discussionId));
  };

  const patchDiscussion = async (req, res) => {
    const { pid, discussionId } = req.params;
    const { resolved } = req.body;
    const discussion = await dao.setDiscussionResolved(pid, discussionId, resolved);
    if (!discussion) return res.status(404).json({ error: "Post or discussion not found" });
    res.json(discussion);
  };

  // ─── Replies ────────────────────────────────────────────────────────────────

  const addReply = async (req, res) => {
    const userId = resolveUserId(req);
    const { pid, discussionId } = req.params;
    const { content } = req.body;
    const reply = await dao.createReply(pid, discussionId, { authorId: userId, content });
    if (!reply) return res.status(404).json({ error: "Post or discussion not found" });
    res.json(reply);
  };

  const updateReply = async (req, res) => {
    const userId = resolveUserId(req);
    const { pid, discussionId, replyId } = req.params;
    const { content } = req.body;
    const user = await dao.findUserById(userId);
    const post = await dao.findPostById(pid);
    if (!post) return res.status(404).json({ error: "Post not found" });
    const discussion = post.followUpDiscussions.find((d) => d.id === discussionId);
    if (!discussion) return res.status(404).json({ error: "Discussion not found" });
    const reply = discussion.replies.find((r) => r.id === replyId);
    if (!reply) return res.status(404).json({ error: "Reply not found" });
    if (!dao.isInstructor(user) && reply.authorId !== userId)
      return res.status(403).json({ error: "Forbidden" });
    const updated = await dao.updateReply(pid, discussionId, replyId, { content });
    res.json(updated);
  };

  const deleteReply = async (req, res) => {
    const userId = resolveUserId(req);
    const { pid, discussionId, replyId } = req.params;
    const user = await dao.findUserById(userId);
    const post = await dao.findPostById(pid);
    if (!post) return res.status(404).json({ error: "Post not found" });
    const discussion = post.followUpDiscussions.find((d) => d.id === discussionId);
    if (!discussion) return res.status(404).json({ error: "Discussion not found" });
    const reply = discussion.replies.find((r) => r.id === replyId);
    if (!reply) return res.status(404).json({ error: "Reply not found" });
    if (!dao.isInstructor(user) && reply.authorId !== userId)
      return res.status(403).json({ error: "Forbidden" });
    res.json(await dao.deleteReply(pid, discussionId, replyId));
  };

  // ─── Folders ────────────────────────────────────────────────────────────────

  const getFolders = async (req, res) => {
    const { courseId } = req.params;
    const folders = await dao.findFoldersByCourse(courseId);
    res.json(folders);
  };

  const createFolder = async (req, res) => {
    const { courseId } = req.params;
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: "name is required" });
    const folder = await dao.createFolder(courseId, name);
    res.json(folder);
  };

  const updateFolder = async (req, res) => {
    const { folderId } = req.params;
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: "name is required" });
    const folder = await dao.updateFolder(folderId, name);
    if (!folder) return res.status(404).json({ error: "Folder not found" });
    res.json(folder);
  };

  const deleteFolder = async (req, res) => {
    const { folderId } = req.params;
    const result = await dao.deleteFolder(folderId);
    if (!result.deletedCount) return res.status(404).json({ error: "Folder not found" });
    res.json({ deleted: folderId });
  };

  // ─── Route Registration ──────────────────────────────────────────────────────

  // Folders
  app.get("/api/courses/:courseId/pazza/folders", getFolders);
  app.post("/api/courses/:courseId/pazza/folders", createFolder);
  app.put("/api/courses/:courseId/pazza/folders/:folderId", updateFolder);
  app.delete("/api/courses/:courseId/pazza/folders/:folderId", deleteFolder);

  // Posts
  app.get("/api/users/:userId/courses/:courseId/pazza", getAllPosts);
  app.post("/api/users/:userId/courses/:courseId/pazza", createPost);
  app.get("/api/users/:userId/courses/:courseId/pazza/:pid", getPostById);
  app.put("/api/users/:userId/courses/:courseId/pazza/:pid", updatePost);
  app.delete("/api/users/:userId/courses/:courseId/pazza/:pid", deletePost);
  app.post("/api/users/:userId/courses/:courseId/pazza/:pid/view", incrementViewCount);

  // Student answers
  app.post("/api/users/:userId/courses/:courseId/pazza/:pid/student-answers", createStudentAnswer);
  app.put("/api/users/:userId/courses/:courseId/pazza/:pid/student-answers/:answerId", updateStudentAnswer);
  app.delete("/api/users/:userId/courses/:courseId/pazza/:pid/student-answers/:answerId", deleteStudentAnswer);

  // Instructor answers
  app.post("/api/users/:userId/courses/:courseId/pazza/:pid/instructor-answers", createInstructorAnswer);
  app.put("/api/users/:userId/courses/:courseId/pazza/:pid/instructor-answers/:answerId", updateInstructorAnswer);
  app.delete("/api/users/:userId/courses/:courseId/pazza/:pid/instructor-answers/:answerId", deleteInstructorAnswer);

  // Discussions
  app.post("/api/users/:userId/courses/:courseId/pazza/:pid/discussions", addFollowUpDiscussion);
  app.patch("/api/users/:userId/courses/:courseId/pazza/:pid/discussions/:discussionId", patchDiscussion);
  app.put("/api/users/:userId/courses/:courseId/pazza/:pid/discussions/:discussionId", updateDiscussion);
  app.delete("/api/users/:userId/courses/:courseId/pazza/:pid/discussions/:discussionId", deleteDiscussion);

  // Replies
  app.post("/api/users/:userId/courses/:courseId/pazza/:pid/discussions/:discussionId/replies", addReply);
  app.put("/api/users/:userId/courses/:courseId/pazza/:pid/discussions/:discussionId/replies/:replyId", updateReply);
  app.delete("/api/users/:userId/courses/:courseId/pazza/:pid/discussions/:discussionId/replies/:replyId", deleteReply);
}