const { collegesPool } = require('../config/dbconfig');

const studentlist = async (req, res) => {
  const { stand, division, college_code } = req.query;

  // Check if required parameters are present
  if (!stand || !division || !college_code) {
    return res.status(400).json({ 
      error: 'Missing required query parameters: stand, division, college_code' 
    });
  }

  try {
    const query = `
      SELECT 
        s.studentid, 
        s.roll_no, 
        s.std, 
        s.Name, 
        s.division, 
        s.profile_img, 
        c.college_code
      FROM 
        Student s
      JOIN 
        College c ON s.college_id = c.collegeID
      WHERE 
        s.std = ? AND 
        s.division = ? AND 
        c.college_code = ?
    `;

    const [rows] = await collegesPool.query(query, [stand, division, college_code]);

    const studentData = rows.map(student => {
      let base64ProfileImg = null;
      if (student.profile_img) {
        base64ProfileImg = student.profile_img.toString('base64').replace(/\n/g, '');
      }

      return {
        ...student,
        profile_img: base64ProfileImg
      };
    });

    res.json(studentData);
  } catch (error) {
    console.error('Error fetching student list:', error);
    res.status(500).json({ success: false, message: 'Error fetching student list.' });
  }
};

module.exports = {
  studentlist
};
