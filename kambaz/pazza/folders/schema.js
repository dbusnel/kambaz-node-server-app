import mongoose from "mongoose";

const folderSchema = new mongoose.Schema(
  {
    _id:      { type: String },
    courseId: { type: String, required: true },
    name:     { type: String, required: true },
  },
  { collection: "pazza_folders" },
);

export default folderSchema;