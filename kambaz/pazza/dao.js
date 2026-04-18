import { v4 as uuidv4 } from "uuid";

export default function PazzaDao(db) {
  const INSTRUCTOR_ROLES = ["FACULTY", "INSTRUCTOR", "TA"];

  const isInstructor = (user) =>
    INSTRUCTOR_ROLES.includes(user?.role?.toUpperCase());

  function findPostsForCourse(courseId, userId) {
    const user = db.users.find((u) => u._id === userId);
    return db.posts
      .filter((p) => {
        if (p.courseId !== courseId) return false;
        if (p.visibility === "instructors") return isInstructor(user);
        if (p.visibility === "individual") return p.visibleTo.includes(userId);
        if (p.visibility === "entire_class") return true;
        return p.visibleTo.includes(userId);
      })
      .map((p) => {
        const author = db.users.find((u) => u._id === p.authorId);
        const readBy = p.readBy ?? [];
        return { ...p, readBy, authorRole: author?.role ?? "STUDENT", unread: !readBy.includes(userId) };
      });
  }

  function findPostById(postId, userId) {
    const post = db.posts.find((p) => p.id === postId) ?? null;
    if (post && userId && !(post.readBy ?? []).includes(userId)) {
      post.readBy = [...(post.readBy ?? []), userId];
    }
    return post;
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
    folderIds = [],
    summary,
    details,
    authorId,
  }) {
    const now = new Date().toISOString();
    const post = {
      id: uuidv4(),
      courseId,
      type,
      visibility,
      visibleTo,
      folderIds,
      summary,
      details,
      authorId,
      answered: false,
      viewCount: 0,
      createdAt: now,
      updatedAt: now,
      readBy: [authorId],
      studentAnswers: [],
      instructorAnswers: [],
      followUpDiscussions: [],
    };
    db.posts = [...db.posts, post];
    return post;
  }

  function updatePost(postId, updates) {
    const post = db.posts.find((p) => p.id === postId || p._id === postId);
    if (!post) return null;
    Object.assign(post, updates, { updatedAt: new Date().toISOString() });
    return post;
  }

  function deletePost(postId) {
    db.posts = db.posts.filter((p) => p.id !== postId && p._id !== postId);
  }

  function incrementViewCount(postId) {
    const post = db.posts.find((p) => p.id === postId || p._id === postId);
    if (!post) return null;
    post.viewCount += 1;
    return post;
  }

  function setDiscussionResolved(postId, discussionId, resolved) {
    const post = db.posts.find((p) => p.id === postId || p._id === postId);
    if (!post) return null;
    const discussion = post.followUpDiscussions.find(
      (d) => d.id === discussionId,
    );
    if (!discussion) return null;
    discussion.resolved = resolved;
    discussion.updatedAt = new Date().toISOString();
    return discussion;
  }

  function createFollowUpDiscussion(postId, { authorId, content }) {
    const post = db.posts.find((p) => p.id === postId || p._id === postId);
    if (!post) return null;
    const discussion = {
      id: uuidv4(),
      authorId,
      content,
      resolved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replies: [],
    };
    post.followUpDiscussions = [...post.followUpDiscussions, discussion];
    post.updatedAt = new Date().toISOString();
    return discussion;
  }

  function updateFollowUpDiscussion(postId, discussionId, { content }) {
    const post = db.posts.find((p) => p.id === postId || p._id === postId);
    if (!post) return null;
    const discussion = post.followUpDiscussions.find((d) => d.id === discussionId);
    if (!discussion) return null;
    discussion.content = content;
    discussion.updatedAt = new Date().toISOString();
    post.updatedAt = discussion.updatedAt;
    return discussion;
  }

  function deleteFollowUpDiscussion(postId, discussionId) {
    const post = db.posts.find((p) => p.id === postId || p._id === postId);
    if (!post) return null;
    post.followUpDiscussions = post.followUpDiscussions.filter((d) => d.id !== discussionId);
    post.updatedAt = new Date().toISOString();
    return { deleted: discussionId };
  }

  function updateReply(postId, discussionId, replyId, { content }) {
    const post = db.posts.find((p) => p.id === postId || p._id === postId);
    if (!post) return null;
    const discussion = post.followUpDiscussions.find((d) => d.id === discussionId);
    if (!discussion) return null;
    const reply = discussion.replies.find((r) => r.id === replyId);
    if (!reply) return null;
    reply.content = content;
    reply.updatedAt = new Date().toISOString();
    discussion.updatedAt = reply.updatedAt;
    return reply;
  }

  function deleteReply(postId, discussionId, replyId) {
    const post = db.posts.find((p) => p.id === postId || p._id === postId);
    if (!post) return null;
    const discussion = post.followUpDiscussions.find((d) => d.id === discussionId);
    if (!discussion) return null;
    discussion.replies = discussion.replies.filter((r) => r.id !== replyId);
    discussion.updatedAt = new Date().toISOString();
    return { deleted: replyId };
  }

  function createStudentAnswer(postId, { authorId, content }) {
    const post = db.posts.find((p) => p.id === postId || p._id === postId);
    if (!post) return null;
    const now = new Date().toISOString();
    const answer = { id: uuidv4(), authorId, content, createdAt: now, updatedAt: now };
    post.studentAnswers = [...post.studentAnswers, answer];
    post.answered = true;
    post.updatedAt = now;
    return answer;
  }

  function updateStudentAnswer(postId, answerId, { content }) {
    const post = db.posts.find((p) => p.id === postId || p._id === postId);
    if (!post) return null;
    const answer = post.studentAnswers.find((a) => a.id === answerId);
    if (!answer) return null;
    answer.content = content;
    answer.updatedAt = new Date().toISOString();
    post.updatedAt = answer.updatedAt;
    return answer;
  }

  function deleteStudentAnswer(postId, answerId) {
    const post = db.posts.find((p) => p.id === postId || p._id === postId);
    if (!post) return null;
    post.studentAnswers = post.studentAnswers.filter((a) => a.id !== answerId);
    if (post.studentAnswers.length === 0 && post.instructorAnswers.length === 0) post.answered = false;
    post.updatedAt = new Date().toISOString();
    return { deleted: answerId };
  }

  function createInstructorAnswer(postId, { authorId, content }) {
    const post = db.posts.find((p) => p.id === postId || p._id === postId);
    if (!post) return null;
    const now = new Date().toISOString();
    const answer = { id: uuidv4(), authorId, content, createdAt: now, updatedAt: now };
    post.instructorAnswers = [...post.instructorAnswers, answer];
    post.answered = true;
    post.updatedAt = now;
    return answer;
  }

  function updateInstructorAnswer(postId, answerId, { content }) {
    const post = db.posts.find((p) => p.id === postId || p._id === postId);
    if (!post) return null;
    const answer = post.instructorAnswers.find((a) => a.id === answerId);
    if (!answer) return null;
    answer.content = content;
    answer.updatedAt = new Date().toISOString();
    post.updatedAt = answer.updatedAt;
    return answer;
  }

  function deleteInstructorAnswer(postId, answerId) {
    const post = db.posts.find((p) => p.id === postId || p._id === postId);
    if (!post) return null;
    post.instructorAnswers = post.instructorAnswers.filter((a) => a.id !== answerId);
    if (post.studentAnswers.length === 0 && post.instructorAnswers.length === 0) post.answered = false;
    post.updatedAt = new Date().toISOString();
    return { deleted: answerId };
  }

  function createReply(postId, discussionId, { authorId, content }) {
    const post = db.posts.find((p) => p.id === postId || p._id === postId);
    if (!post) return null;
    const discussion = post.followUpDiscussions.find(
      (d) => d.id === discussionId,
    );
    if (!discussion) return null;
    const reply = {
      id: uuidv4(),
      authorId,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    discussion.replies = [...discussion.replies, reply];
    discussion.updatedAt = new Date().toISOString();
    return reply;
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
    setDiscussionResolved,
    createFollowUpDiscussion,
    createReply,
    updateFollowUpDiscussion,
    deleteFollowUpDiscussion,
    updateReply,
    deleteReply,
    createStudentAnswer,
    updateStudentAnswer,
    deleteStudentAnswer,
    createInstructorAnswer,
    updateInstructorAnswer,
    deleteInstructorAnswer,
  };
}
