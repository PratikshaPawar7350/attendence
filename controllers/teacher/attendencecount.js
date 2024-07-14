const { collegesPool } = require('../../config/dbconfig');

const getSundaysInMonth = (year, month) => {
    const sundays = [];
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        if (date.getDay() === 0) { // 0 represents Sunday
            sundays.push(day);
        }
    }
    return sundays;
};

const attendencecount = async (req, res) => {
    try {
        const { std, division, year, month, college_id } = req.query;

        if (!std || !division || !year || !month || !college_id) {
            return res.status(400).json({ error: 'Missing required query parameters: std, division, year, month, or college_id' });
        }

        const yearInt = parseInt(year, 10);
        const monthInt = parseInt(month, 10);

        if (isNaN(yearInt) || isNaN(monthInt) || monthInt < 1 || monthInt > 12) {
            return res.status(400).json({ error: 'Invalid year or month parameter' });
        }

        const monthStr = monthInt.toString().padStart(2, '0');
        const tableName = `attendance_${yearInt}_${monthStr}`;
        const daysInMonth = new Date(yearInt, monthInt, 0).getDate();
        const sundays = getSundaysInMonth(yearInt, monthInt);

        let attendanceCountsQuery = `
            SELECT
                ${Array.from({ length: daysInMonth }, (_, i) => {
                    const day = (i + 1).toString().padStart(2, '0');
                    if (sundays.includes(i + 1)) return ''; // Skip Sundays
                    const dateColumn = `${yearInt}-${monthStr}-${day}`;
                    return `
                        '${dateColumn}' AS date_${day},
                        SUM(CASE WHEN a.\`${dateColumn}\` = 1 THEN 1 ELSE 0 END) AS present_count_${day},
                        SUM(CASE WHEN a.\`${dateColumn}\` = 0 THEN 1 ELSE 0 END) AS absent_count_${day}
                    `;
                }).filter(Boolean).join(', ')}
            FROM 
                ${tableName} a
            JOIN 
                Student s ON a.student_id = s.studentid
            WHERE 
                s.std = ? AND s.division = ? AND s.college_id = ? 
        `;

        const [rows] = await collegesPool.query(attendanceCountsQuery, [std, division, college_id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'No attendance records found for the specified criteria' });
        }

        const result = [];
        for (let i = 0; i < daysInMonth; i++) {
            if (sundays.includes(i + 1)) continue; // Skip Sundays
            const day = (i + 1).toString().padStart(2, '0');
            result.push({
                date: rows[0][`date_${day}`],
                present_count: rows[0][`present_count_${day}`],
                absent_count: rows[0][`absent_count_${day}`]
            });
        }

        return res.status(200).json(result);
    } catch (err) {
        console.error('Error occurred:', err);
        if (err.code === 'ECONNRESET') {
            return res.status(500).json({ error: 'Database connection was reset' });
        } else {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = {
    attendencecount
};
