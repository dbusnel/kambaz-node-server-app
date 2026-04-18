import { v4 as uuidv4 } from "uuid";
import PostModel from "./posts/model.js";
import FolderModel from "./folders/model.js";
import UserModel from "../users/model.js";

const INSTRUCTOR_ROLES = ["FACULTY", "INSTRUCTOR", "TA"];

const isInstructor = (user) =>
  INSTRUCTOR_ROLES.includes(user?.role?.toUpperCase());

// ─── Posts ────────────────────────────────────────────────────────────────────

async function findPostsForCourse(courseId, userId) {
  const user = await UserModel.findById(userId);
  const allPosts = await PostModel.find({ courseId });

  return allPosts
    .filter((p) => {
      if (p.visibility === "instructors") return isInstructor(user);
      if (p.visibility === "individual") return p.visibleTo.includes(userId);
      return true; // entire_class
    })
    .map((p) => {
      const obj = p.toObject();
      const readBy = obj.readBy ?? [];
      return {
        ...obj,
        readBy,
        unread: !readBy.includes(userId),
      };
    });
}

async function findPostById(postId, userId) {
  const post = await PostModel.findById(postId);
  if (!post) return null;
  if (userId && !post.readBy.includes(userId)) {
    post.readBy.push(userId);
    await post.save();
  }
  return post.toObject();
}

async function findPostsByFolder(courseId, folderId, userId) {
  const posts = await findPostsForCourse(courseId, userId);
  return posts.filter((p) => p.folderIds.includes(folderId));
}

async function createPost({
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
  const post = await PostModel.create({
    _id: uuidv4(),
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
    readBy: [authorId],
    studentAnswers: [],
    instructorAnswers: [],
    followUpDiscussions: [],
    createdAt: now,
    updatedAt: now,
  });
  return post.toObject();
}

async function updatePost(postId, updates) {
  const post = await PostModel.findByIdAndUpdate(
    postId,
    { $set: { ...updates, updatedAt: new Date().toISOString() } },
    { new: true },
  );
  return post ? post.toObject() : null;
}

async function deletePost(postId) {
  return PostModel.deleteOne({ _id: postId });
}

async function incrementViewCount(postId) {
  const post = await PostModel.findByIdAndUpdate(
    postId,
    { $inc: { viewCount: 1 } },
    { new: true },
  );
  return post ? post.toObject() : null;
}

// ─── Answers ─────────────────────────────────────────────────────────────────

async function createStudentAnswer(postId, { authorId, content }) {
  const now = new Date().toISOString();
  const answer = { id: uuidv4(), authorId, content, createdAt: now, updatedAt: now };
  const post = await PostModel.findByIdAndUpdate(
    postId,
    { $push: { studentAnswers: answer }, $set: { answered: true, updatedAt: now } },
    { new: true },
  );
  return post ? answer : null;
}

async function updateStudentAnswer(postId, answerId, { content }) {
  const now = new Date().toISOString();
  const post = await PostModel.findOneAndUpdate(
    { _id: postId, "studentAnswers.id": answerId },
    { $set: { "studentAnswers.$.content": content, "studentAnswers.$.updatedAt": now, updatedAt: now } },
    { new: true },
  );
  if (!post) return null;
  return post.studentAnswers.find((a) => a.id === answerId);
}

async function deleteStudentAnswer(postId, answerId) {
  const now = new Date().toISOString();
  const post = await PostModel.findByIdAndUpdate(
    postId,
    { $pull: { studentAnswers: { id: answerId } }, $set: { updatedAt: now } },
    { new: true },
  );
  if (!post) return null;
  if (post.studentAnswers.length === 0 && post.instructorAnswers.length === 0) {
    await PostModel.findByIdAndUpdate(postId, { $set: { answered: false } });
  }
  return { deleted: answerId };
}

async function createInstructorAnswer(postId, { authorId, content }) {
  const now = new Date().toISOString();
  const answer = { id: uuidv4(), authorId, content, createdAt: now, updatedAt: now };
  const post = await PostModel.findByIdAndUpdate(
    postId,
    { $push: { instructorAnswers: answer }, $set: { answered: true, updatedAt: now } },
    { new: true },
  );
  return post ? answer : null;
}

async function updateInstructorAnswer(postId, answerId, { content }) {
  const now = new Date().toISOString();
  const post = await PostModel.findOneAndUpdate(
    { _id: postId, "instructorAnswers.id": answerId },
    { $set: { "instructorAnswers.$.content": content, "instructorAnswers.$.updatedAt": now, updatedAt: now } },
    { new: true },
  );
  if (!post) return null;
  return post.instructorAnswers.find((a) => a.id === answerId);
}

async function deleteInstructorAnswer(postId, answerId) {
  const now = new Date().toISOString();
  const post = await PostModel.findByIdAndUpdate(
    postId,
    { $pull: { instructorAnswers: { id: answerId } }, $set: { updatedAt: now } },
    { new: true },
  );
  if (!post) return null;
  if (post.studentAnswers.length === 0 && post.instructorAnswers.length === 0) {
    await PostModel.findByIdAndUpdate(postId, { $set: { answered: false } });
  }
  return { deleted: answerId };
}

// ─── Follow-up Discussions ────────────────────────────────────────────────────

async function createFollowUpDiscussion(postId, { authorId, content }) {
  const now = new Date().toISOString();
  const discussion = {
    id: uuidv4(),
    authorId,
    content,
    resolved: false,
    createdAt: now,
    updatedAt: now,
    replies: [],
  };
  const post = await PostModel.findByIdAndUpdate(
    postId,
    { $push: { followUpDiscussions: discussion }, $set: { updatedAt: now } },
    { new: true },
  );
  return post ? discussion : null;
}

async function updateFollowUpDiscussion(postId, discussionId, { content }) {
  const now = new Date().toISOString();
  const post = await PostModel.findOneAndUpdate(
    { _id: postId, "followUpDiscussions.id": discussionId },
    { $set: { "followUpDiscussions.$.content": content, "followUpDiscussions.$.updatedAt": now, updatedAt: now } },
    { new: true },
  );
  if (!post) return null;
  return post.followUpDiscussions.find((d) => d.id === discussionId);
}

async function deleteFollowUpDiscussion(postId, discussionId) {
  const now = new Date().toISOString();
  await PostModel.findByIdAndUpdate(
    postId,
    { $pull: { followUpDiscussions: { id: discussionId } }, $set: { updatedAt: now } },
  );
  return { deleted: discussionId };
}

async function setDiscussionResolved(postId, discussionId, resolved) {
  const now = new Date().toISOString();
  const post = await PostModel.findOneAndUpdate(
    { _id: postId, "followUpDiscussions.id": discussionId },
    { $set: { "followUpDiscussions.$.resolved": resolved, "followUpDiscussions.$.updatedAt": now } },
    { new: true },
  );
  if (!post) return null;
  return post.followUpDiscussions.find((d) => d.id === discussionId);
}

// ─── Replies ──────────────────────────────────────────────────────────────────

async function createReply(postId, discussionId, { authorId, content }) {
  const now = new Date().toISOString();
  const reply = { id: uuidv4(), authorId, content, createdAt: now, updatedAt: now };
  // MongoDB can't $push into a nested array by filter, so we use findById + save
  const post = await PostModel.findById(postId);
  if (!post) return null;
  const discussion = post.followUpDiscussions.find((d) => d.id === discussionId);
  if (!discussion) return null;
  discussion.replies.push(reply);
  discussion.updatedAt = now;
  post.updatedAt = now;
  await post.save();
  return reply;
}

async function updateReply(postId, discussionId, replyId, { content }) {
  const now = new Date().toISOString();
  const post = await PostModel.findById(postId);
  if (!post) return null;
  const discussion = post.followUpDiscussions.find((d) => d.id === discussionId);
  if (!discussion) return null;
  const reply = discussion.replies.find((r) => r.id === replyId);
  if (!reply) return null;
  reply.content = content;
  reply.updatedAt = now;
  discussion.updatedAt = now;
  post.updatedAt = now;
  await post.save();
  return reply;
}

async function deleteReply(postId, discussionId, replyId) {
  const now = new Date().toISOString();
  const post = await PostModel.findById(postId);
  if (!post) return null;
  const discussion = post.followUpDiscussions.find((d) => d.id === discussionId);
  if (!discussion) return null;
  discussion.replies = discussion.replies.filter((r) => r.id !== replyId);
  discussion.updatedAt = now;
  post.updatedAt = now;
  await post.save();
  return { deleted: replyId };
}

// ─── Folders ──────────────────────────────────────────────────────────────────

async function findFoldersByCourse(courseId) {
  return FolderModel.find({ courseId });
}

async function createFolder(courseId, name) {
  return FolderModel.create({ _id: uuidv4(), courseId, name: name.trim() });
}

async function updateFolder(folderId, name) {
  return FolderModel.findByIdAndUpdate(
    folderId,
    { $set: { name: name.trim() } },
    { new: true },
  );
}

async function deleteFolder(folderId) {
  return FolderModel.deleteOne({ _id: folderId });
}

// ─── Users (read-only, for role checks) ──────────────────────────────────────

async function findUserById(userId) {
  return UserModel.findById(userId);
}

export default function PazzaDao() {
  return {
    isInstructor,
    findUserById,
    findPostsForCourse,
    findPostById,
    findPostsByFolder,
    createPost,
    updatePost,
    deletePost,
    incrementViewCount,
    createStudentAnswer,
    updateStudentAnswer,
    deleteStudentAnswer,
    createInstructorAnswer,
    updateInstructorAnswer,
    deleteInstructorAnswer,
    createFollowUpDiscussion,
    updateFollowUpDiscussion,
    deleteFollowUpDiscussion,
    setDiscussionResolved,
    createReply,
    updateReply,
    deleteReply,
    findFoldersByCourse,
    createFolder,
    updateFolder,
    deleteFolder,
  };
}