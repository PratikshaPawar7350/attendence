const { collegesPool } = require('../config/dbconfig');
// Define a function to convert buffer to base64
const bufferToBase64 = (buffer) => {
    return Buffer.from(buffer).toString('base64');
};

const subjects = async (req, res, next) => {
    const { standard } = req.query;

    if (!standard) {
        return res.status(400).json({ error: 'Standard parameter is required' });
    }

    try {
        const sql = `SELECT subject_code, subject_name, stand, division, subject_code_prefixed, image FROM Subject WHERE stand = ?`;

        const [rows, fields] = await collegesPool.query(sql, [standard]);

        const subjectData = rows.map(subject => ({
            subject_code: subject.subject_code,
            subject_name: subject.subject_name,
            stand: subject.stand,
            division: subject.division,
            subject_code_prefixed: subject.subject_code_prefixed,
            image: subject.image ? bufferToBase64(subject.image) : null
        }));

        res.json(subjectData);
    } catch (err) {
        console.error('Error fetching subject data:', err);
        res.status(500).json({ error: 'Error fetching subject data' });
    }
};
module.exports = { subjects};