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

  app.get("/api/users/:userId/courses/:courseId/pazza", getAllPosts);
  app.get("/api/users/:userId/courses/:courseId/pazza/:pid", getPostById);
}
