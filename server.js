const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const db = require('./lib/db');
const path = require('path');
require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
    secret: 'caremate_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 2 } // 2시간
}));

// 로그인 페이지
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// 회원가입 처리 (간단 버전)
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPw = await bcrypt.hash(password, 10);
    try {
        await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPw]);
        res.send("<script>alert('회원가입 완료! 로그인해주세요.'); location.href='/login';</script>");
    } catch (e) {
        res.send("<script>alert('이미 존재하는 아이디입니다.'); history.back();</script>");
    }
});

// 로그인 처리 (One-Session-Policy 포함)
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length > 0 && await bcrypt.compare(password, rows[0].password)) {
        const user = rows[0];

        // 중복 로그인 방지: 현재 세션 ID를 DB에 저장
        const sessionId = req.sessionID;
        await db.query('UPDATE users SET last_session_id = ? WHERE id = ?', [sessionId, user.id]);

        req.session.user = { id: user.id, username: user.username };
        res.redirect('/');
    } else {
        res.render('login', { error: '아이디 또는 비밀번호가 틀렸습니다.' });
    }
});

// 메인 대시보드 (세션 체크 미들웨어 포함)
app.get('/', async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    // 중복 로그인 체크
    const [rows] = await db.query('SELECT last_session_id FROM users WHERE id = ?', [req.session.user.id]);
    if (rows[0].last_session_id !== req.sessionID) {
        req.session.destroy();
        return res.send("<script>alert('다른 곳에서 로그인되어 로그아웃됩니다.'); location.href='/login';</script>");
    }

    res.render('index', { user: req.session.user });
});

const ai = require('./lib/ai');

// AI 상담 API
app.post('/api/chat', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ text: "로그인이 필요합니다." });

    const { message } = req.body;
    const result = await ai.getChatResponse(message);
    res.json(result);
});

app.listen(3000, () => console.log('CareMate AI running on http://localhost:3000'));