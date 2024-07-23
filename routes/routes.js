const express = require('express');
const router = express.Router();
const { validateCollegeCode } = require('../middleware/validation');
const { setupDatabaseConnection, closeDatabaseConnection } = require('../middleware/database');
// const { checkCollege } = require('../controllers/collegeController');
const { teacherProfile } = require('../controllers/teacherprofile');
const { studentlist } = require('../controllers/studentlist');
const { subjectlistclassteacher } = require('../controllers/subjectlistclassteacher');
const { insertAttendance, fetchStudentAttendance } = require('../controllers/teacher/insertattendence');
const { addReason } = require('../controllers/teacher/addreason');
const {fetchreason} = require('../controllers/teacher/fetchreason');
const { attendencecount } = require('../controllers/teacher/attendencecount');
const { teacherLogin } = require('../controllers/teacherLogin');
const { loginStudent } = require('../controllers/studentlogin');
const { profile } = require('../controllers/studentprofile');
const { subjects } = require('../controllers/subjectlist');

router.get('/teacher_profile', teacherProfile);

router.post('/loginteacher', teacherLogin);
router.get('/subjectlist', subjectlistclassteacher);
router.get('/students', studentlist);
router.get('/studentprofile', profile);
router.post('/login', loginStudent);
router.post('/insert', insertAttendance);
router.get('/fetchattendance', fetchStudentAttendance);
router.get('/attendencecount', attendencecount);

router.get('/subjects', subjects);

const { parentlogin } = require('../controllers/parents/parentlogin');
const { parentprofile } = require('../controllers/parents/parentprofile');
router.get('/parentprofile', parentprofile);
router.post('/parentlogin', parentlogin);
router.post('/add-reason', addReason);
router.get('/fetch_reason', fetchreason);

module.exports = router;
