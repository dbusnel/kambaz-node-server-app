import mongoose from "mongoose";
const assignmentSchema = new mongoose.Schema(
  {
    _id: String,
    name: { type: String, required: true },
    course: { type: String, required: true },
    description: String,
    points: { type: Number, default: 100 },
    availableDate: String,
    availableTime: String,
    availableUntilDate: String,
    availableUntilTime: String,
    dueDate: String,
    dueTime: String,
    homeModule: String,
  },
  { collection: "assignments" }
);
export default assignmentSchema;
