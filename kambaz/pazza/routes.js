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
    const { userId, pid } = req.params;
    const post = dao.findPostById(pid, userId);
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
    if (!summary?.trim()) return res.status(400).json({ error: "summary is required" });
    if (summary.trim().length > 100) return res.status(400).json({ error: "summary must be 100 characters or fewer" });
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

  const updateDiscussion = (req, res) => {
    const { userId, pid, discussionId } = req.params;
    const { content } = req.body;
    const user = db.users.find((u) => u._id === userId);
    const post = dao.findPostById(pid);
    if (!post) return res.status(404).json({ error: "Post not found" });
    const discussion = post.followUpDiscussions.find((d) => d.id === discussionId);
    if (!discussion) return res.status(404).json({ error: "Discussion not found" });
    if (!dao.isInstructor(user) && discussion.authorId !== userId) return res.status(403).json({ error: "Forbidden" });
    res.json(dao.updateFollowUpDiscussion(pid, discussionId, { content }));
  };

  const deleteDiscussion = (req, res) => {
    const { userId, pid, discussionId } = req.params;
    const user = db.users.find((u) => u._id === userId);
    const post = dao.findPostById(pid);
    if (!post) return res.status(404).json({ error: "Post not found" });
    const discussion = post.followUpDiscussions.find((d) => d.id === discussionId);
    if (!discussion) return res.status(404).json({ error: "Discussion not found" });
    if (!dao.isInstructor(user) && discussion.authorId !== userId) return res.status(403).json({ error: "Forbidden" });
    res.json(dao.deleteFollowUpDiscussion(pid, discussionId));
  };

  const updateReply = (req, res) => {
    const { userId, pid, discussionId, replyId } = req.params;
    const { content } = req.body;
    const user = db.users.find((u) => u._id === userId);
    const post = dao.findPostById(pid);
    if (!post) return res.status(404).json({ error: "Post not found" });
    const discussion = post.followUpDiscussions.find((d) => d.id === discussionId);
    if (!discussion) return res.status(404).json({ error: "Discussion not found" });
    const reply = discussion.replies.find((r) => r.id === replyId);
    if (!reply) return res.status(404).json({ error: "Reply not found" });
    if (!dao.isInstructor(user) && reply.authorId !== userId) return res.status(403).json({ error: "Forbidden" });
    res.json(dao.updateReply(pid, discussionId, replyId, { content }));
  };

  const deleteReply = (req, res) => {
    const { userId, pid, discussionId, replyId } = req.params;
    const user = db.users.find((u) => u._id === userId);
    const post = dao.findPostById(pid);
    if (!post) return res.status(404).json({ error: "Post not found" });
    const discussion = post.followUpDiscussions.find((d) => d.id === discussionId);
    if (!discussion) return res.status(404).json({ error: "Discussion not found" });
    const reply = discussion.replies.find((r) => r.id === replyId);
    if (!reply) return res.status(404).json({ error: "Reply not found" });
    if (!dao.isInstructor(user) && reply.authorId !== userId) return res.status(403).json({ error: "Forbidden" });
    res.json(dao.deleteReply(pid, discussionId, replyId));
  };

  const createStudentAnswer = (req, res) => {
    const { userId, courseId, pid } = req.params;
    const { content } = req.body;
    const user = db.users.find((u) => u._id === userId);
    if (dao.isInstructor(user)) return res.status(403).json({ error: "Instructors cannot post student answers" });
    const post = dao.findPostById(pid);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.studentAnswers.length > 0) return res.status(400).json({ error: "Student answer already exists" });
    res.json(dao.createStudentAnswer(pid, { authorId: userId, content }));
  };

  const updateStudentAnswer = (req, res) => {
    const { userId, pid, answerId } = req.params;
    const { content } = req.body;
    const user = db.users.find((u) => u._id === userId);
    const post = dao.findPostById(pid);
    if (!post) return res.status(404).json({ error: "Post not found" });
    const answer = post.studentAnswers.find((a) => a.id === answerId);
    if (!answer) return res.status(404).json({ error: "Answer not found" });
    if (!dao.isInstructor(user) && answer.authorId !== userId) return res.status(403).json({ error: "Forbidden" });
    res.json(dao.updateStudentAnswer(pid, answerId, { content }));
  };

  const deleteStudentAnswer = (req, res) => {
    const { userId, pid, answerId } = req.params;
    const user = db.users.find((u) => u._id === userId);
    const post = dao.findPostById(pid);
    if (!post) return res.status(404).json({ error: "Post not found" });
    const answer = post.studentAnswers.find((a) => a.id === answerId);
    if (!answer) return res.status(404).json({ error: "Answer not found" });
    if (!dao.isInstructor(user) && answer.authorId !== userId) return res.status(403).json({ error: "Forbidden" });
    res.json(dao.deleteStudentAnswer(pid, answerId));
  };

  const createInstructorAnswer = (req, res) => {
    const { userId, pid } = req.params;
    const { content } = req.body;
    const user = db.users.find((u) => u._id === userId);
    if (!dao.isInstructor(user)) return res.status(403).json({ error: "Only instructors can post instructor answers" });
    const post = dao.findPostById(pid);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.instructorAnswers.length > 0) return res.status(400).json({ error: "Instructor answer already exists" });
    res.json(dao.createInstructorAnswer(pid, { authorId: userId, content }));
  };

  const updateInstructorAnswer = (req, res) => {
    const { userId, pid, answerId } = req.params;
    const { content } = req.body;
    const user = db.users.find((u) => u._id === userId);
    if (!dao.isInstructor(user)) return res.status(403).json({ error: "Forbidden" });
    const post = dao.findPostById(pid);
    if (!post) return res.status(404).json({ error: "Post not found" });
    const answer = post.instructorAnswers.find((a) => a.id === answerId);
    if (!answer) return res.status(404).json({ error: "Answer not found" });
    res.json(dao.updateInstructorAnswer(pid, answerId, { content }));
  };

  const deleteInstructorAnswer = (req, res) => {
    const { userId, pid, answerId } = req.params;
    const user = db.users.find((u) => u._id === userId);
    if (!dao.isInstructor(user)) return res.status(403).json({ error: "Forbidden" });
    const post = dao.findPostById(pid);
    if (!post) return res.status(404).json({ error: "Post not found" });
    const answer = post.instructorAnswers.find((a) => a.id === answerId);
    if (!answer) return res.status(404).json({ error: "Answer not found" });
    res.json(dao.deleteInstructorAnswer(pid, answerId));
  };

  const updatePost = (req, res) => {
    const { userId, pid } = req.params;
    const { summary, details } = req.body;
    const user = db.users.find((u) => u._id === userId);
    const post = dao.findPostById(pid);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (!dao.isInstructor(user) && post.authorId !== userId) return res.status(403).json({ error: "Forbidden" });
    if (summary !== undefined && summary.trim().length > 100) return res.status(400).json({ error: "summary must be 100 characters or fewer" });
    res.json(dao.updatePost(pid, { summary, details }));
  };

  const deletePost = (req, res) => {
    const { userId, pid } = req.params;
    const user = db.users.find((u) => u._id === userId);
    const post = dao.findPostById(pid);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (!dao.isInstructor(user) && post.authorId !== userId) return res.status(403).json({ error: "Forbidden" });
    dao.deletePost(pid);
    res.json({ deleted: pid });
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
  app.put("/api/users/:userId/courses/:courseId/pazza/:pid/discussions/:discussionId", updateDiscussion);
  app.delete("/api/users/:userId/courses/:courseId/pazza/:pid/discussions/:discussionId", deleteDiscussion);
  app.put("/api/users/:userId/courses/:courseId/pazza/:pid/discussions/:discussionId/replies/:replyId", updateReply);
  app.delete("/api/users/:userId/courses/:courseId/pazza/:pid/discussions/:discussionId/replies/:replyId", deleteReply);
  app.post("/api/users/:userId/courses/:courseId/pazza/:pid/student-answers", createStudentAnswer);
  app.put("/api/users/:userId/courses/:courseId/pazza/:pid/student-answers/:answerId", updateStudentAnswer);
  app.delete("/api/users/:userId/courses/:courseId/pazza/:pid/student-answers/:answerId", deleteStudentAnswer);
  app.post("/api/users/:userId/courses/:courseId/pazza/:pid/instructor-answers", createInstructorAnswer);
  app.put("/api/users/:userId/courses/:courseId/pazza/:pid/instructor-answers/:answerId", updateInstructorAnswer);
  app.delete("/api/users/:userId/courses/:courseId/pazza/:pid/instructor-answers/:answerId", deleteInstructorAnswer);
  app.post("/api/users/:userId/courses/:courseId/pazza/:pid/view", (req, res) => {
    const { pid } = req.params;
    const post = dao.incrementViewCount(pid);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json({ viewCount: post.viewCount });
  });

  app.get("/api/users/:userId/courses/:courseId/pazza", getAllPosts);
  app.post("/api/users/:userId/courses/:courseId/pazza", createPost);
  app.get("/api/users/:userId/courses/:courseId/pazza/:pid", getPostById);
  app.put("/api/users/:userId/courses/:courseId/pazza/:pid", updatePost);
  app.delete("/api/users/:userId/courses/:courseId/pazza/:pid", deletePost);
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
