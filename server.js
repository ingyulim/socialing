const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어
app.use(cors());
app.use(bodyParser.json());

// 메모리 데이터 저장소 (실제 프로덕션에서는 데이터베이스 사용)
let rooms = {};
let participants = {};

// 관리자 인증 (파일 관리)
const DATA_DIR = path.join(__dirname, 'data');
const PASSWORD_FILE = path.join(DATA_DIR, 'admin_password.txt');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(PASSWORD_FILE)) {
  fs.writeFileSync(PASSWORD_FILE, '0000', 'utf-8');
}

function readAdminPassword() {
  try {
    return fs.readFileSync(PASSWORD_FILE, 'utf-8').trim();
  } catch (e) {
    fs.writeFileSync(PASSWORD_FILE, '0000', 'utf-8');
    return '0000';
  }
}

function writeAdminPassword(newPassword) {
  fs.writeFileSync(PASSWORD_FILE, String(newPassword), 'utf-8');
}

let adminToken = null;

function generateId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function generateToken() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

function requireAdmin(req, res, next) {
  const token = req.header('x-admin-token');
  if (!adminToken || token !== adminToken) {
    return res.status(401).json({ success: false, message: '관리자 인증이 필요합니다.' });
  }
  next();
}

// 관리자 로그인
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  const current = readAdminPassword();
  if (password !== current) {
    return res.status(401).json({ success: false, message: '비밀번호가 올바르지 않습니다.' });
  }
  adminToken = generateToken();
  res.json({ success: true, token: adminToken });
});

// 관리자 비밀번호 변경 (관리자 전용)
app.post('/api/admin/password', requireAdmin, (req, res) => {
  const { newPassword } = req.body || {};
  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 4) {
    return res.status(400).json({ success: false, message: '새 비밀번호가 유효하지 않습니다.' });
  }
  writeAdminPassword(newPassword);
  // 토큰은 유지 (원하면 무효화 로직 가능)
  res.json({ success: true, message: '비밀번호가 변경되었습니다.' });
});

// 방 생성 (관리자 전용)
app.post('/api/admin/rooms', requireAdmin, (req, res) => {
  const { roomId } = req.body;

  if (!roomId || !/^\d+$/.test(roomId)) {
    return res.status(400).json({ success: false, message: '방 번호는 숫자만 입력 가능합니다.' });
  }
  if (rooms[roomId]) {
    return res.status(400).json({ success: false, message: '이미 존재하는 방 번호입니다.' });
  }

  rooms[roomId] = {
    id: roomId,
    createdAt: new Date(),
    participants: []
  };

  res.json({ success: true, roomId, message: '방이 성공적으로 생성되었습니다.' });
});

// 방 삭제 (관리자 전용)
app.delete('/api/admin/rooms/:roomId', requireAdmin, (req, res) => {
  const { roomId } = req.params;
  if (!rooms[roomId]) {
    return res.status(404).json({ success: false, message: '존재하지 않는 방입니다.' });
  }
  if (rooms[roomId].participants) {
    rooms[roomId].participants.forEach(p => delete participants[p.id]);
  }
  delete rooms[roomId];
  res.json({ success: true, message: '방이 성공적으로 삭제되었습니다.' });
});

// 방 목록 (관리자용, 상세)
app.get('/api/admin/rooms', requireAdmin, (req, res) => {
  res.json({ success: true, rooms });
});

// 방 목록 (공개, 게스트용)
app.get('/api/rooms', (req, res) => {
  const list = Object.values(rooms).map(r => ({
    id: r.id,
    createdAt: r.createdAt,
    participantsCount: r.participants.length
  }));
  res.json({ success: true, rooms: list });
});

// 방 정보 조회 (공개)
app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms[roomId];
  if (!room) {
    return res.status(404).json({ success: false, message: '방을 찾을 수 없습니다.' });
  }
  res.json({ success: true, room: { id: room.id, createdAt: room.createdAt, participantsCount: room.participants.length } });
});

// 특정 방의 참가자 목록 조회 (공개)
app.get('/api/rooms/:roomId/participants', (req, res) => {
  const { roomId } = req.params;
  const room = rooms[roomId];
  if (!room) {
    return res.status(404).json({ success: false, message: '방을 찾을 수 없습니다.' });
  }
  res.json({ success: true, participants: room.participants });
});

// 참가자 추가 (공개)
app.post('/api/rooms/:roomId/participants', (req, res) => {
  const { roomId } = req.params;
  const { nickname } = req.body;
  if (!rooms[roomId]) {
    return res.status(404).json({ success: false, message: '방을 찾을 수 없습니다.' });
  }
  const existingParticipant = rooms[roomId].participants.find(p => p.nickname === nickname);
  if (existingParticipant) {
    return res.status(400).json({ success: false, message: '이미 사용 중인 닉네임입니다.' });
  }
  const participantId = generateId();
  const participant = { id: participantId, nickname, score: 0, joinedAt: new Date() };
  rooms[roomId].participants.push(participant);
  participants[participantId] = participant;
  res.json({ success: true, participant });
});

// 점수 업데이트 (관리자 전용)
app.put('/api/participants/:participantId/score', requireAdmin, (req, res) => {
  const { participantId } = req.params;
  const { action, value } = req.body;
  const participant = participants[participantId];
  if (!participant) {
    return res.status(404).json({ success: false, message: '참가자를 찾을 수 없습니다.' });
  }
  switch (action) {
    case 'add':
      participant.score += value || 1;
      break;
    case 'subtract':
      participant.score -= value || 1;
      break;
    case 'set':
      participant.score = value;
      break;
    default:
      return res.status(400).json({ success: false, message: '잘못된 액션입니다.' });
  }
  res.json({ success: true, participant });
});

app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
