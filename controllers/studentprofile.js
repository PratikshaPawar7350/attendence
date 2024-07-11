const { collegesPool } = require('../config/dbconfig');

const profile = async (req, res) => {
  const { studentid, college_code } = req.query;

  if (!studentid || !college_code) {
    return res.status(400).json({ error: 'studentid and college_code parameters are required' });
  }

  try {
    const sql = `
      SELECT 
        s.studentid, 
        s.Name AS fullname, 
        s.std AS standard, 
        s.roll_no AS rollnumber, 
        s.division, 
        s.stud_dob AS dob, 
        s.mobile, 
        s.profile_img AS profilephoto
      FROM 
        Student s
      JOIN 
        College c ON s.college_id = c.collegeID
      WHERE 
        s.studentid = ? AND c.college_code = ?
    `;
    
    const [results] = await collegesPool.query(sql, [studentid, college_code]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'Profile not found for the provided studentid and college_code' });
    }

    const profile = results[0];
    const profileData = {
      studentid: profile.studentid,
      fullname: profile.fullname,
      standard: profile.standard,
      rollnumber: profile.rollnumber,
      division: profile.division,
      dob: profile.dob,
      mobile: profile.mobile,
      profilephoto: profile.profilephoto ? profile.profilephoto.toString('base64') : null
    };

    res.json(profileData);
  } catch (err) {
    console.error('Error fetching profile data:', err);
    res.status(500).json({ error: 'Error fetching profile data' });
  }
};

module.exports = {
  profile
};
