const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const axios = require('axios');

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

app.post('/bot-communication', async (req, res) => {
  const { message } = req.body;
  console.log("Received message:", message); // 요청 수신 시 로그

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: message }
      ],
      max_tokens: 150,
      n: 1,
      stop: null,
      temperature: 0.5,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, // Bearer 토큰 사용
        'Content-Type': 'application/json',
      },
    });

    console.log('API response:', response.data.choices[0].message.content); // API 응답 로그
    res.json({ response: response.data.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Something went wrong', details: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});