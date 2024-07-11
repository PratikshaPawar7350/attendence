const mysql = require('mysql2/promise'); // Assuming you are using mysql2 for database connection
const { collegesPool } = require('../../config/dbconfig');

const parentlogin = async (req, res) => {
    const { parent_id, password, college_code } = req.body;

    if (!parent_id || !password || !college_code) {
        return res.status(400).json({ error: 'Parent ID, password, and college code are required parameters' });
    }

    try {
        const parentQuery = `
            SELECT 
                p.parent_id,
                p.parentname,
                p.password
            FROM Parents p
            JOIN College c ON p.college_id = c.collegeID
            WHERE p.parent_id = ? AND c.college_code = ?
        `;

        const [parentDetails] = await collegesPool.query(parentQuery, [parent_id, college_code]);

        if (parentDetails.length === 0) {
            return res.status(404).json({ error: 'Parent not found or invalid credentials' });
        }

        const parent = parentDetails[0];

        // Check password
        if (parent.password !== password) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const parentData = { 
            parent_id: parent.parent_id,
            parentname: parent.parentname,
        };

        return res.status(200).json({ success: true, message: 'Successfully logged in', data: parentData });
    } catch (error) {
        console.error('Error executing query:', error);

        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    parentlogin
};
