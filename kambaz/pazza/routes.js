import PazzaDao from "./dao.js";
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

  app.get("/api/users/:userId/courses/:courseId/pazza", getAllPosts);
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
