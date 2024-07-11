const { collegesPool } = require('../config/dbconfig');

const loginStudent = async (req, res) => {
    const { studentId, password, college_code } = req.body;

    if (!studentId || !password || !college_code) {
        return res.status(400).json({ error: 'studentId, password, and college_code are required parameters' });
    }

    try {
        const studentSql = `
            SELECT 
                s.studentid, 
                s.Name, 
                s.std, 
                s.roll_no, 
                s.division, 
                s.stud_dob, 
                s.mobile,
                s.email, 
                s.password, 
                c.college_code,
                s.profile_img 
            FROM 
                Student s
            JOIN 
                College c ON s.college_id = c.CollegeID
            WHERE 
                BINARY s.studentid = BINARY ? AND BINARY c.college_code = BINARY ?
        `;

        const [studentResults] = await collegesPool.query(studentSql, [studentId, college_code]);

        if (studentResults.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const student = studentResults[0];

        if (student.password !== password) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        let base64ProfileImg = null;
        if (student.profile_img) {
            base64ProfileImg = student.profile_img.toString('base64').replace(/\n/g, '');
        }

        const studentData = { ...student, profile_img: base64ProfileImg };

        return res.status(200).json({ success: true, message: 'Successfully logged in', data: studentData });
    } catch (error) {
        console.error('Error executing query:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    loginStudent
};
