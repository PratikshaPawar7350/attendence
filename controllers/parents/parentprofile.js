const mysql = require('mysql2/promise'); // Assuming you are using mysql2 for database connection
const { collegesPool } = require('../../config/dbconfig');
const parentprofile = async (req, res) => {
    const { parent_id } = req.query;

    if (!parent_id ) {
        return res.status(400).json({ error: 'Parent ID required parameter' });
    }

    try {
        const parentQuery = `
            SELECT 
                p.parent_id,
                p.parentname,
                p.pmobile_no,
                p.profilephoto,
                p.address,
                p.email,
                p.birth_date,
                GROUP_CONCAT(s.Name SEPARATOR ', ') AS student_names  -- Concatenate student names
            FROM Parents p
            JOIN Student s ON p.parent_id = s.parent_id
            WHERE p.parent_id = ?
            GROUP BY p.parent_id, p.parentname, p.pmobile_no, p.profilephoto, p.address, p.email, p.birth_date
        `;

        const [parentDetails] = await collegesPool.query(parentQuery, [parent_id]);

        if (parentDetails.length === 0) {
            return res.status(404).json({ error: 'Parent not found or invalid credentials' });
        }

        const parent = parentDetails[0];

        // Convert profilephoto to base64
        let base64ProfilePhoto = null;
        if (parent.profilephoto) {
            base64ProfilePhoto = parent.profilephoto.toString('base64').replace(/\n/g, '');
        }

        const parentData = { 
            parent_id: parent.parent_id,
            parentname: parent.parentname,
            pmobile_no: parent.pmobile_no,
            profilephoto: base64ProfilePhoto,
            address: parent.address,
            birth_date: parent.birth_date,
            email: parent.email,
            student_names: parent.student_names  // Include concatenated student names
        };

        return res.status(200).json({  data: parentData });
    } catch (error) {
        console.error('Error executing query:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    parentprofile
};
