const express = require('express');
const router = express.Router();

// Import the controller function
const { getAllCourses } = require('../controllers/courseController');

// Define the route
// When a GET request is made to '/', it will run the getAllCourses function
router.get('/', getAllCourses);

module.exports = router;