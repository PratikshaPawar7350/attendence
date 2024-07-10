const { collegesPool } = require('../config/dbconfig');

const subjectlistclassteacher = async (req, res) => {
    const { teacher_id, college_code } = req.query;

    // Validate inputs
    if (!teacher_id || !college_code) {
        return res.status(400).json({ 
            error: 'Missing required query parameters: teacher_id, college_code' 
        });
    }

    try {
        // Execute SQL query
        const [rows] = await collegesPool.execute(`
            SELECT 
                s.subject_name,
                s.subject_code_prefixed AS subject_code,
                cl.standard,
                cl.division,
                t.teacher_id
            FROM 
                timetables t
            JOIN 
                Subject s ON t.subject_code = s.subject_code_prefixed
            JOIN 
                Classes cl ON t.class_id = cl.class_id
            JOIN 
                College co ON t.college_id = co.collegeID
            WHERE 
                t.teacher_id = ? AND
                co.college_code = ?
        `, [teacher_id, college_code]);

        // Respond with JSON data
        res.json(rows);
    } catch (error) {
        // Handle errors
        console.error('Error in subjectlistclassteacher:', error);
        res.status(500).send('Server error');
    }
};

module.exports = {
    subjectlistclassteacher
};
