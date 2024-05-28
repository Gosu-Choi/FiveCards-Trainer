const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(bodyParser.json());

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && await bcrypt.compare(password, user.password)) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

app.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Signup error:', error); // 오류 로그 출력
    if (error.code === 'P2002') {
      res.json({ success: false, message: 'User already exists' });
    } else {
      res.json({ success: false, message: 'Signup failed' });
    }
  }
});


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});