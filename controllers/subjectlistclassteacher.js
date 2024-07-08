const { collegesPool } = require('../config/dbconfig');

const subjectlistclassteacher = async (req, res) => {
    const { standard, division, teacher_id, college_code } = req.query;
    if (!standard || !division || !teacher_id || !college_code) {
        return res.status(400).json({ 
            error: 'Missing required query parameters: standard, division, teacher_id, college_code' 
        });
    }
    try {
        const [rows] = await collegesPool.execute(`
            SELECT 
                s.subject_name,
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
                cl.standard = ? AND
                cl.division = ? AND
                t.teacher_id = ? AND
                co.college_code = ?
        `, [standard, division, teacher_id, college_code]);

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

module.exports = {
    subjectlistclassteacher
};
