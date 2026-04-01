import { v4 as uuidv4 } from "uuid";

export default function PazzaDao(db) {
  const INSTRUCTOR_ROLES = ["FACULTY", "INSTRUCTOR", "TA"];

  const isInstructor = (user) =>
    INSTRUCTOR_ROLES.includes(user?.role?.toUpperCase());

  function findPostsForCourse(courseId, userId) {
    const user = db.users.find((u) => u._id === userId);
    return db.posts.filter((p) => {
      if (p.courseId !== courseId) return false;
      if (p.visibility === "instructors") {
        return isInstructor(user);
      }
      if (p.visibility === "individual") {
        return p.visibleTo.includes(userId);
      }
      if (p.visibility === "entire_class") return true;

      return p.visibleTo.includes(userId);
    });
  }

  function findPostById(postId) {
    return db.posts.find((p) => p.id === postId) ?? null;
  }

  function findPostsByFolder(courseId, folderId, userId) {
    return findPostsForCourse(courseId, userId).filter((p) =>
      p.folderIds.includes(folderId),
    );
  }

  function createPost({
    courseId,
    type,
    visibility,
    visibleTo = [],
    folderIds,
    summary,
    details,
    authorId,
  }) {
    const post = {
      _id: uuidv4(),
      courseId,
      type,
      visibility,
      visibleTo,
      folderIds,
      summary,
      details,
      authorId,
      viewCount: 0,
      createdAt: now(),
      updatedAt: now(),
      studentAnswers: [],
      instructorAnswers: [],
      followUpDiscussions: [],
    };
    db.posts = [...db.posts, post];
    return post;
  }

  function updatePost(postId, updates) {
    const post = db.posts.find((p) => p._id === postId);
    if (!post) return null;
    Object.assign(post, updates, { updatedAt: now() });
    return post;
  }

  function deletePost(postId) {
    db.posts = db.posts.filter((p) => p._id !== postId);
  }

  function incrementViewCount(postId) {
    const post = db.posts.find((p) => p._id === postId);
    if (!post) return null;
    post.viewCount += 1;
    return post;
  }

  return {
    isInstructor,
    findPostsForCourse,
    findPostById,
    findPostsByFolder,
    createPost,
    updatePost,
    deletePost,
    incrementViewCount,
  };
}
