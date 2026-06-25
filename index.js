require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const users = [
  { email: 'admin@hr.com', password: 'admin123', role: 'admin' },
  { email: 'hr@hr.com', password: 'hr123', role: 'hr' },
  { email: 'employee@hr.com', password: 'employee123', role: 'employee' }
];

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt:", email, password);

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.json({ token, role: user.role });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});