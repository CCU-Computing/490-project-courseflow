const mongoose = require('mongoose');
const { Schema } = mongoose;

const CourseSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: String,
  code: String,
  credits: Number,
  description: String,
  prerequisites: { type: Schema.Types.Mixed, default: {} },
  semesters_offered: [String]
});

module.exports = mongoose.model('Course', CourseSchema);