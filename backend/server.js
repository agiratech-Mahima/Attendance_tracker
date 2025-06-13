



const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');


app.use(cors());
app.use(express.json());


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root', // Replace with your actual password
  database: 'attendance_tracker' // Replace with your actual DB name
});


db.connect(err => {
  if (err) {
    console.error('❌ MySQL connection error:', err);
    return;
  }
  console.log('✅ Connected to MySQL database');
});


app.use(express.static(path.join(__dirname, '../frontend')));


app.get('/search', (req, res) => {
  const name = req.query.employee_name;
  if (!name) return res.status(400).json({ error: 'Employee name is required' });

  const query = 'SELECT * FROM attendance WHERE employee_name = ? ORDER BY timestamp DESC';
  db.query(query, [name], (err, results) => {
    if (err) {
      console.error('❌ SQL Error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// ✅ Example route (you can expand as needed)
// app.post('/checkin', ...);
// app.post('/checkout', ...);
// app.get('/export-today', ...);
app.get('/export-today', (req, res) => {
  const { employee_name } = req.query;
  if (!employee_name) return res.status(400).json({ message: 'Name is required' });

  const query = `
    SELECT action, timestamp FROM attendance 
    WHERE employee_name = ? AND DATE(timestamp) = CURDATE()
    ORDER BY timestamp ASC
  `;
  db.query(query, [employee_name], (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });

    let csv = 'Action,Timestamp\n';
    results.forEach(row => {
      csv += `${row.action},${new Date(row.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n`;
    });

    res.setHeader('Content-disposition', 'attachment; filename=attendance.csv');
    res.set('Content-Type', 'text/csv');
    res.status(200).send(csv);
  });
});



app.post('/mark', (req, res) => {
  const { employee_name, action } = req.body;

  const insertQuery = 'INSERT INTO attendance (employee_name, action, timestamp) VALUES (?, ?, NOW())';

  db.query(insertQuery, [employee_name, action], (err, result) => {
    if (err) return res.status(500).json({ message: 'DB Error', error: err });

    // After inserting, fetch today's earliest check-in and latest check-out
    const checkQuery = `
      SELECT 
        MIN(CASE WHEN action = 'Check-in' THEN timestamp END) AS checkin,
        MAX(CASE WHEN action = 'Check-out' THEN timestamp END) AS checkout
      FROM attendance
      WHERE employee_name = ? AND DATE(timestamp) = CURDATE()
    `;

    db.query(checkQuery, [employee_name], (err2, results) => {
      if (err2) return res.status(500).json({ message: 'Fetch Error', error: err2 });

      const row = results[0];
      const checkinTime = row.checkin 
        ? new Date(row.checkin).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) 
        : '--';
      const checkoutTime = row.checkout 
        ? new Date(row.checkout).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) 
        : '--';

      res.json({
        message: `${action} recorded for ${employee_name}`,
        checkinTime,
        checkoutTime
      });
    });
  });
});




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
