
const express = require('express');
const router = express.Router();
const { validateCollegeCode } = require('../middleware/validation');
const { setupDatabaseConnection, closeDatabaseConnection } = require('../middleware/database');
//const { checkCollege } = require('../controllers/collegeController');
const { teacherProfile } = require('../controllers/teacherprofile');
const { studentList } = require('../controllers/studentlist');
const { subjectlistclassteacher } = require('../controllers/subjectlistclassteacher');

const { teacherLogin } = require('../controllers/teacherLogin');
router.get('/teacher_profile',  teacherProfile);

router.post('/loginteacher',  teacherLogin);
router.get('/subjectlist', subjectlistclassteacher);
router.get('/students' ,studentList);
module.exports = router;

