const { collegesPool } = require('../config/dbconfig');

const teacherProfile = async (req, res) => {
    const { teacher_code, college_code } = req.query;
    if (!teacher_code || !college_code) {
        return res.status(400).json({ error: 'teacher_code and college_code are required parameters' });
    }

    try {
        const teacherQuery = `
            SELECT 
                t.teacher_code, t.tname, t.tpassword, t.mobileno, t.teacher_email, t.teacher_profile, 
                t.date_of_birth, t.teacher_education 
            FROM 
                teacher t
            JOIN 
                College c ON t.college_code = c.college_code
            WHERE 
                t.teacher_code = ? AND t.college_code = ?
        `;

      /*  const subjectList = `
            SELECT s.subject_name
            FROM colleges.Subject s
            JOIN subject_teacher st ON s.subject_code_prefixed = st.subject_code
            WHERE st.teacher_code = ?
        `;
*/
        // Execute teacher details query
        const [teacherDetails] = await collegesPool.query(teacherQuery, [teacher_code, college_code]);

        // Execute subjects query
      //  const [subjects] = await collegesPool.query(subjectList, [teacher_code]);

        if (teacherDetails.length === 0) {
            return res.status(404).json({ error: 'Teacher not found' });
        }

        const teacher = teacherDetails[0];

        // Convert profile image to base64 if it exists
        let base64ProfileImg = null;
        if (teacher.teacher_profile) {
            base64ProfileImg = teacher.teacher_profile.toString('base64').replace(/\n/g, '');
        }

        // Combine teacher details and subjects
        const teacherData = { 
            ...teacher, 
            teacher_profile: base64ProfileImg,
         //   subjects: subjects.map(subject => subject.subject_name) 
        };

        return res.status(200).json({ teacherData });
    } catch (error) {
        console.error('Error executing query:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    teacherProfile
};
