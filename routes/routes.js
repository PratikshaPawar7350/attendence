
const express = require('express');
const router = express.Router();
const { validateCollegeCode } = require('../middleware/validation');
const { setupDatabaseConnection, closeDatabaseConnection } = require('../middleware/database');
//const { checkCollege } = require('../controllers/collegeController');
const { teacherProfile } = require('../controllers/teacherprofile');
const { studentList } = require('../controllers/studentlist');
const { subjectlistclassteacher } = require('../controllers/subjectlistclassteacher');
const { insertAttendance, fetchStudentAttendance } = require('../controllers/teacher/insertattendence');

const { teacherLogin } = require('../controllers/teacherLogin');
const { loginStudent } = require('../controllers/studentlogin');
const { profile } = require('../controllers/studentprofile');


router.get('/teacher_profile',  teacherProfile);

router.post('/loginteacher',  teacherLogin);
router.get('/subjectlist', subjectlistclassteacher);
router.get('/students' ,studentList);
router.get('/studentprofile' ,profile);
router.post('/login', loginStudent);
router.post('/insert',  insertAttendance);
router.get('/fetchattendance',fetchStudentAttendance);


const { parentlogin } = require('../controllers/parents/parentlogin');
const { parentprofile} = require('../controllers/parents/parentprofile');
router.get('/parentprofile',  parentprofile);

router.post('/parentlogin',  parentlogin);
module.exports = router;

