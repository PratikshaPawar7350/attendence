
const express = require('express');
const router = express.Router();
const { validateCollegeCode } = require('../middleware/validation');
const { setupDatabaseConnection, closeDatabaseConnection } = require('../middleware/database');
//const { checkCollege } = require('../controllers/collegeController');

const { teacherLogin } = require('../controllers/teacherLogin');

router.post('/loginteacher',  teacherLogin);


module.exports = router;

