module.exports = {
  validateCollegeCode: (req, res, next) => {
    console.log('Request Query:', req.query); // Logging query parameters instead of body for debugging

    if (!req.query || !req.query.college_code) {
      return res.status(400).json({ error: 'collegeCode is missing in the request body' });
    }
    next();
  }
};
