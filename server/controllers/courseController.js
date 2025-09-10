const Course = require('../models/courseModel');

/**
 * @desc    Get all courses from the database
 * @route   GET /api/courses
 * @access  Public
 */
exports.getAllCourses = async (req, res) => {
  try {
    // Use the Course model to find all documents in the 'courses' collection
    const courses = await Course.find({});
    
    // Send a success response with the courses data
    res.status(200).json(courses);
  } catch (error) {
    // If an error occurs, send a server error response
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};