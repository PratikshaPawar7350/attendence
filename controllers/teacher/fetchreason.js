const { collegesPool } = require('../../config/dbconfig');

const fetchreason = async (req, res) => {
    let connection;

    try {
        const { date, student_id, college_code } = req.query;

        if (!date || !student_id || !college_code) {
            return res.status(400).json({ error: 'Missing required parameters: date, student_id, and college_code' });
        }

        // Validate date format (YYYY-MM-DD)
        if (!/^(\d{4})-(\d{2})-(\d{2})$/.test(date)) {
            return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
        }

        const formattedDate = new Date(date).toISOString().split('T')[0];
        const year = new Date(date).getFullYear();
        const month = new Date(date).getMonth() + 1;

        const tableName = `attendance_${year}_${month.toString().padStart(2, '0')}`;

        connection = await collegesPool.getConnection();

        const [collegeRows] = await connection.query(
            'SELECT collegeID FROM College WHERE college_code = ?',
            [college_code]
        );

        if (collegeRows.length === 0) {
            return res.status(400).json({ error: 'Invalid college code' });
        }

        const college_id = collegeRows[0].collegeID;

        const [tableExists] = await connection.query('SHOW TABLES LIKE ?', [tableName]);

        if (tableExists.length === 0) {
            return res.status(404).json({ message: `Attendance table for ${year}-${month} does not exist` });
        }

        const [statusRows] = await connection.query(
            `SELECT \`${formattedDate}\` AS attendance_status
             FROM \`${tableName}\`
             WHERE student_id = ? AND college_id = ?`,
            [student_id, college_id]
        );

        if (statusRows.length === 0 || statusRows[0].attendance_status === null) {
            return res.status(200).json({ message: 'Data not entered for the selected date' });
        }

        const attendanceStatus = statusRows[0].attendance_status.toString();

        if (attendanceStatus === '1') {
            return res.status(200).json({ message: 'Student was present on this date' });
        } else if (attendanceStatus === '2') {
            const [holidayRows] = await connection.query(
                'SELECT description FROM holidays WHERE date = ?',
                [formattedDate]
            );

            if (holidayRows.length > 0) {
                return res.status(200).json({ message: `Holiday: ${holidayRows[0].description}` });
            } else {
                return res.status(200).json({ message: 'No holiday description available' });
            }
        } else {
            const [reasonRows] = await connection.query(
                'SELECT reason FROM addreason WHERE student_id = ? AND date = ? AND college_id = ?',
                [student_id, formattedDate, college_id]
            );

            if (reasonRows.length > 0) {
                return res.status(200).json({ reason: reasonRows[0].reason });
            } else {
                return res.status(200).json({ message: 'Student was absent on this date but no reason provided' });
            }
        }
    } catch (err) {
        console.error('Error occurred:', err);
        return res.status(500).send('Internal server error');
    } finally {
        if (connection) connection.release();
    }
};

module.exports = { fetchreason };
