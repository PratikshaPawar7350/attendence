const { collegesPool } = require('../../config/dbconfig');

const createAttendanceTable = async (pool, tableName) => {
    try {
        const [year, month] = tableName.split('_').slice(1);
        const daysInMonth = new Date(year, month, 0).getDate();

        const dateColumns = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const date = new Date(year, month - 1, day);
            if (date.getDay() !== 0) { // Exclude Sundays
                return `\`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}\` TINYINT DEFAULT NULL`;
            }
            return null;
        }).filter(Boolean);

        const createAttendanceTableQuery = `
            CREATE TABLE IF NOT EXISTS ${tableName} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id VARCHAR(40) NOT NULL,
                subject_id VARCHAR(40) NOT NULL,
                college_id INT,
                ${dateColumns.join(', ')},
                FOREIGN KEY (student_id) REFERENCES Student(studentid),
                FOREIGN KEY (subject_id) REFERENCES Subject(subject_code_prefixed),
                FOREIGN KEY (college_id) REFERENCES College(CollegeID)
            )
        `;

        await pool.query(createAttendanceTableQuery);
    } catch (err) {
        if (err.errno === 150) {
            console.error('Foreign key constraint error:', err.sqlMessage);
        } else {
            console.error('Error creating attendance table:', err);
        }
        throw err;
    }
};

const insertAttendance = async (req, res) => {
    try {
        const { subject_id, date, collegeId } = req.query;
        const { records } = req.body;

        if (!subject_id || !collegeId || !date) {
            return res.status(400).json({ error: 'Subject ID, college ID, or date is missing' });
        }

        if (!Array.isArray(records) || records.length === 0) {
            return res.status(400).json({ error: 'No attendance records provided' });
        }

        const formattedDate = new Date(date).toISOString().split('T')[0];
        const year = new Date(date).getFullYear();
        const month = (new Date(date).getMonth() + 1).toString().padStart(2, '0');
        const tableName = `attendance_${year}_${month}`;

        const [rows] = await collegesPool.query(`SHOW TABLES LIKE ?`, [tableName]);
        if (rows.length === 0) {
            await createAttendanceTable(collegesPool, tableName);
            console.log(`Created table ${tableName}`);
        }

        for (const record of records) {
            const { student_id, status } = record;
            if (!student_id || !status) {
                return res.status(400).json({ error: 'Missing required parameters in one or more records' });
            }

            const attendanceStatus = status === 'present' ? 1 : 0;
            const [existingRows] = await collegesPool.query(`SELECT * FROM ${tableName} WHERE student_id = ?`, [student_id]);

            if (existingRows.length > 0) {
                const existingValue = existingRows[0][formattedDate];
                if (existingValue === null) {
                    const updateAttendanceQuery = `
                        UPDATE ${tableName}
                        SET \`${formattedDate}\` = ?
                        WHERE student_id = ?
                    `;
                    await collegesPool.query(updateAttendanceQuery, [attendanceStatus, student_id]);
                } else {
                    console.log(`Attendance already exists for student ${student_id} on ${formattedDate}`);
                }
            } else {
                const insertAttendanceQuery = `
                    INSERT INTO ${tableName} (student_id, subject_id, collegeId, \`${formattedDate}\`)
                    VALUES (?, ?, ?, ?)
                `;
                await collegesPool.query(insertAttendanceQuery, [student_id, subject_id, collegeId, attendanceStatus]);
            }
        }

        return res.status(200).json({ message: 'Attendance records inserted/updated successfully' });
    } catch (err) {
        console.error('Error occurred:', err);
        return res.status(500).send('Internal server error');
    }
};


const moment = require('moment');
const fetchStudentAttendance = async (req, res) => {
    const { currentYear, currentMonth, student_id } = req.query;

    if (!currentYear || !currentMonth || !student_id) {
        return res.status(400).json({ error: 'Missing required query parameters: currentYear, currentMonth, student_id' });
    }

    function generateQuery(currentYear, currentMonth) {
        const monthStr = currentMonth.toString().padStart(2, '0'); // Ensure two-digit month
        let initialTable = `attendance_${currentYear}_${monthStr}`;
        let query = `SELECT * FROM ${initialTable}`;
        let previousTable = initialTable;

        for (let year = currentYear; year >= 2024; year--) {
            for (let month = currentMonth; month >= 6; month--) {
                const monthStr = month.toString().padStart(2, '0'); // Ensure two-digit month
                const tableName = `attendance_${year}_${monthStr}`;
                if (tableName === initialTable) {
                    continue;
                }

                query += ` LEFT JOIN ${tableName} ON ${previousTable}.student_id = ${tableName}.student_id`;
                previousTable = tableName;
            }
            currentMonth = 12;  // Reset to December after the first year
        }

        query += ` WHERE ${initialTable}.student_id = ?`;  // Add condition to query
        return query;
    }

    try {
        const query = generateQuery(Number(currentYear), Number(currentMonth));
        console.log(query);

        const [results] = await collegesPool.query(query, [student_id]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const attendanceData = [];

        results.forEach(row => {
            // Iterate through each row's keys (which are dates in string format)
            Object.keys(row).forEach(key => {

            

                if (key !== 'student_id' /*&& row[key] !== null*/) {

                    const dateMoment = moment(key, 'YYYY-MM-DD', true);
                    if (dateMoment.isValid()) {
                        const formattedDate = dateMoment.format('YYYY-MM-DD');
                        attendanceData.push({ date: formattedDate, status: row[key] });
                    }
                }
            });
        });

        res.json({ attendanceData });
    } catch (error) {
        console.error('Error executing query:', error);
        return res.status(500).json({ error: 'An internal server error occurred' });
    }
};

module.exports = {  insertAttendance ,fetchStudentAttendance };