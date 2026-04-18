import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    id:        { type: String, required: true },
    authorId:  { type: String, required: true },
    content:   { type: String, default: "" },
    createdAt: { type: String },
    updatedAt: { type: String },
  },
  { _id: false },
);

const followUpDiscussionSchema = new mongoose.Schema(
  {
    id:        { type: String, required: true },
    authorId:  { type: String, required: true },
    content:   { type: String, default: "" },
    resolved:  { type: Boolean, default: false },
    createdAt: { type: String },
    updatedAt: { type: String },
    replies:   { type: [replySchema], default: [] },
  },
  { _id: false },
);

const answerSchema = new mongoose.Schema(
  {
    id:        { type: String, required: true },
    authorId:  { type: String, required: true },
    content:   { type: String, default: "" },
    createdAt: { type: String },
    updatedAt: { type: String },
  },
  { _id: false },
);

const postSchema = new mongoose.Schema(
  {
    _id:                  { type: String },
    courseId:             { type: String, required: true },
    type:                 { type: String, enum: ["question", "note"], default: "question" },
    visibility:           { type: String, enum: ["entire_class", "individual", "instructors"], default: "entire_class" },
    visibleTo:            { type: [String], default: [] },
    folderIds:            { type: [String], default: [] },
    summary:              { type: String, required: true, maxlength: 100 },
    details:              { type: String, default: "" },
    authorId:             { type: String, required: true },
    answered:             { type: Boolean, default: false },
    viewCount:            { type: Number, default: 0 },
    readBy:               { type: [String], default: [] },
    studentAnswers:       { type: [answerSchema], default: [] },
    instructorAnswers:    { type: [answerSchema], default: [] },
    followUpDiscussions:  { type: [followUpDiscussionSchema], default: [] },
    createdAt:            { type: String },
    updatedAt:            { type: String },
  },
  { collection: "pazza_posts" },
);

export default postSchema;