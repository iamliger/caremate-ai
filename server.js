require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const db = require('./lib/db'); // 이전 단계에서 만든 db.js 활용

const app = express();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'caremate_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 2 } // 2시간
}));

// --- Routes ---

// 메인 페이지 (세션 체크 및 중복 로그인 방지)
app.get('/', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    try {
        const [rows] = await db.query('SELECT last_session_id FROM users WHERE id = ?', [req.session.user.id]);
        if (rows.length > 0 && rows[0].last_session_id !== req.sessionID) {
            req.session.destroy();
            return res.send("<script>alert('다른 기기에서 로그인되어 로그아웃됩니다.'); location.href='/login';</script>");
        }
        res.render('index', { user: req.session.user });
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
});

// 로그인 페이지
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// 로그인 처리
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length > 0 && await bcrypt.compare(password, rows[0].password)) {
            const user = rows[0];
            await db.query('UPDATE users SET last_session_id = ? WHERE id = ?', [req.sessionID, user.id]);
            req.session.user = { id: user.id, username: user.username };
            res.redirect('/');
        } else {
            res.render('login', { error: '아이디 또는 비밀번호가 올바르지 않습니다.' });
        }
    } catch (err) {
        res.status(500).send("Login Error");
    }
});

// 회원가입 처리
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPw = await bcrypt.hash(password, 10);
    try {
        await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPw]);
        res.send("<script>alert('가입 완료! 로그인해주세요.'); location.href='/login';</script>");
    } catch (e) {
        res.send("<script>alert('중복된 아이디입니다.'); history.back();</script>");
    }
});

// 로그아웃
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// --- AI 상담 API (Hybrid: Gemini + Ollama) ---
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    const prompt = `너는 지능형 건강 코치 '엘리스'야. 사용자의 고민: "${message}". 따뜻하게 격려하고 3줄 이내로 해결책을 말해줘.`;

    try {
        // 1. Gemini 시도
        const model = genAI.getGenerativeModel({ model: process.env.MODEL_NAME || "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        res.json({ source: 'Gemini', text: response.text() });
    } catch (error) {
        console.log("Gemini Error, switching to Ollama...");
        try {
            // 2. Ollama (로컬) 시도
            const ollamaRes = await axios.post(process.env.OLLAMA_URL || 'http://localhost:11434/api/chat', {
                model: "llama3",
                messages: [{ role: "user", content: prompt }],
                stream: false
            });
            res.json({ source: 'Ollama(Local)', text: ollamaRes.data.message.content });
        } catch (ollamaErr) {
            res.json({ source: 'System', text: "엘리스가 잠시 생각 중이에요. 잠시 후 다시 말을 걸어주세요!" });
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 CareMate Server: http://localhost:${PORT}`));