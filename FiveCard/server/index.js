const OpenAI = require("openai");
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const path = require('path');

const app = express();
const prisma = new PrismaClient();

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
  dangerouslyAllowBrowser: true,
});

app.use(cors());
app.use(bodyParser.json());

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && await bcrypt.compare(password, user.password)) {
    res.json({ success: true, money: user.money });
  } else {
    res.json({ success: false });
  }
});

app.post('/api/signup', async (req, res) => {
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

app.post('/api/bot-communication', async (req, res) => {
  const { message } = req.body;
  console.log("Received message:", message); // 요청 수신 시 로그

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: message },
        { role: "user", content: `Do the thing system requires.` }
      ],
      max_tokens: 500,
      temperature: 0.5,
    });

    res.json({ response: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong', details: error.message });
  }
});

app.post('/api/bot-help', async (req, res) => {
  const { message } = req.body;
  console.log("Received message:", message); // 요청 수신 시 로그

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: message,
      max_tokens: 150,
      temperature: 0.5,
    });

    res.json({ response: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong', details: error.message });
  }
});

app.post('/api/save', async (req, res) => {
  const { email, money } = req.body;

  try {
    const user = await prisma.user.update({
      where: { email: email },
      data: { money: money },
    });
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 정적 파일 제공 경로 설정
const clientBuildPath = path.join(__dirname, 'client/build');
app.use(express.static(clientBuildPath));

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});