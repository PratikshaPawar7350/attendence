const { collegesPool } = require('../../config/dbconfig');

const addReason = async (req, res) => {
    const { student_id, date, reason } = req.body;
    const { college_code } = req.query;

    if (!student_id || !date || !reason || !college_code) {
        return res.status(400).json({ error: 'Invalid input data' });
    }

    const year = new Date(date).getFullYear();
    const month = new Date(date).getMonth() + 1; // Month is zero-indexed
    const tableName = `attendance_${year}_${month.toString().padStart(2, '0')}`;

    let connection;
    try {
        connection = await collegesPool.getConnection();

        console.log('College code:', college_code);
        
        const [collegeRows] = await connection.query(
            'SELECT collegeID FROM College WHERE college_code = ?',
            [college_code]
        );

        console.log('College query result:', collegeRows);

        if (collegeRows.length === 0) {
            return res.status(400).json({ error: 'Invalid college code' });
        }

        const college_id = collegeRows[0].collegeID; // Update to use the correct column name

        const [existingReason] = await connection.query(
            `SELECT ar.* 
             FROM addreason ar 
             JOIN College c ON ar.college_id = c.collegeID
             WHERE ar.student_id = ? AND ar.date = ? AND c.college_code = ?`,
            [student_id, date, college_code]
        );

        if (existingReason.length > 0) {
            return res.status(400).json({ error: 'Reason already exists for this date and student' });
        }

        const formattedDate = new Date(date).toISOString().split('T')[0];
        const checkStatusQuery = `
            SELECT \`${formattedDate}\` AS status
            FROM ${tableName}
            WHERE student_id = ?
        `;

        const [statusRows] = await connection.query(checkStatusQuery, [student_id]);

        if (statusRows.length === 0 || statusRows[0].status === null) {
            return res.status(400).json({ message: 'Data not entered for the selected date' });
        }

        const attendanceStatus = statusRows[0].status;

        if (attendanceStatus === 1) {
            return res.status(400).json({ message: 'Student was present on this date' });
        } else if (attendanceStatus === 0) {
            await connection.query(
                'INSERT INTO addreason (date, reason, student_id, college_id) VALUES (?, ?, ?, ?)',
                [date, reason, student_id, college_id]
            );

            res.status(200).json({ success: true, message: 'Reason added successfully' });
        } else if (attendanceStatus === 2) {
            const query = 'SELECT description FROM holidays WHERE date = ? AND college_id = ?';
            const [holidayRows] = await connection.query(query, [date, college_id]);

            const holidayDescription = holidayRows.length > 0 ? holidayRows[0].description : 'No description available';
            return res.status(400).json({ error: `Holiday: ${holidayDescription}` });
        } else {
            return res.status(400).json({ error: 'Invalid attendance status' });
        }

    } catch (error) {
        console.error('Failed to add reason:', error);
        res.status(500).json({ error: 'Failed to add reason' });
    } finally {
        if (connection) connection.release();
    }
};

module.exports = { addReason };
