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

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    console.log(`\n[${new Date().toLocaleTimeString()}] 📩 사용자 질문: ${message}`);

    // 프롬프트를 더 강력하게 (한국어 강제)
    const prompt = `당신은 지능형 건강 코치 '엘리스'입니다. 
    지침: 
    1. 반드시 한국어(Korean)로만 답변하십시오. 영어를 절대 사용하지 마십시오.
    2. 사용자에게 따뜻한 존댓말을 사용하십시오.
    3. 답변은 3줄 이내로 핵심만 전달하십시오.
    
    사용자의 고민: "${message}"
    엘리스의 한국어 답변:`;

    try {
        console.log(`[AI] Gemini 요청 중... (Model: gemini-1.5-flash)`);
        // 모델명을 직접 지정하거나 환경변수 확인
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiText = response.text().trim();

        console.log(`[AI] Gemini 응답 성공: ${aiText.substring(0, 40)}...`);
        res.json({ source: 'Gemini', text: aiText });

    } catch (error) {
        console.log(`[⚠️ Gemini 에러]: ${error.message}`);
        console.log(`[AI] Ollama(로컬)로 전환하여 한국어 응답을 시도합니다...`);

        try {
            const ollamaRes = await axios.post(process.env.OLLAMA_URL || 'http://localhost:11434/api/chat', {
                model: "llama3", // 혹은 설치하신 gemma2 등
                messages: [{ role: "user", content: prompt + " (반드시 한국어로 대답하세요)" }],
                stream: false
            });
            const ollamaText = ollamaRes.data.message.content.trim();
            console.log(`[AI] Ollama 응답 성공: ${ollamaText.substring(0, 40)}...`);
            res.json({ source: 'Ollama(Local)', text: ollamaText });

        } catch (ollamaErr) {
            console.log(`[🚨 AI 전원 꺼짐]: ${ollamaErr.message}`);
            res.json({ source: 'System', text: "죄송해요. 현재 상담이 어렵습니다. 잠시 후 다시 시도해 주세요." });
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 CareMate Server: http://localhost:${PORT}`));