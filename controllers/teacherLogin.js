const { collegesPool } = require('../config/dbconfig');

const teacherLogin = async (req, res) => {
    const { teacher_code, tpassword } = req.body;

    if (!teacher_code || !tpassword) {
        return res.status(400).json({ error: 'teacherID and password are required parameters' });
    }

    try {
        const teacherQuery = `
            SELECT 
                teacher_code, tname, tpassword, mobileno, teacher_email, teacher_profile, date_of_birth, teacher_education, ct.standard, ct.division, t.college_code 
            FROM 
                teacher t
                JOIN 
                College c ON t.college_code = c.college_code
                LEFT JOIN
                classteachers ct ON t.teacher_code = ct.teacher_id
            WHERE 
                t.teacher_code = ?
        `;
        
        const [teacherDetails] = await collegesPool.query(teacherQuery, [teacher_code]);

        if (teacherDetails.length === 0) {
            return res.status(404).json({ error: 'Teacher not found' });
        }

        const teacher = teacherDetails[0];

        if (teacher.tpassword !== tpassword) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        let base64ProfileImg = null;
        if (teacher.teacher_profile) {
            base64ProfileImg = teacher.teacher_profile.toString('base64').replace(/\n/g, '');
        }

        const teacherData = {
            teacher_code: teacher.teacher_code,
            tname: teacher.tname,
            mobileno: teacher.mobileno,
            teacher_email: teacher.teacher_email,
            teacher_profile: base64ProfileImg,
            date_of_birth: teacher.date_of_birth,
            teacher_education: teacher.teacher_education,
            standard: teacher.standard,
            division: teacher.division,
            college_code: teacher.college_code
        };

        return res.status(200).json({ success: true, message: 'Successfully logged in', data: teacherData });
    } catch (error) {
        console.error('Error executing query:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    teacherLogin
};
