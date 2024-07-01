
const express = require('express');
const router = express.Router();
const { validateCollegeCode } = require('../middleware/validation');
const { setupDatabaseConnection, closeDatabaseConnection } = require('../middleware/database');
//const { checkCollege } = require('../controllers/collegeController');
const { teacherProfile } = require('../controllers/teacherprofile');

const { teacherLogin } = require('../controllers/teacherLogin');
router.get('/teacher_profile',  teacherProfile);

router.post('/loginteacher',  teacherLogin);


module.exports = router;

