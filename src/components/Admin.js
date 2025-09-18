import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import QRCode from 'react-qr-code';
import axios from 'axios';

// 현재 프라이빗 IP 감지 함수
const getCurrentIP = () => {
  // 현재 URL에서 hostname 추출
  const hostname = window.location.hostname;
  
  // localhost나 127.0.0.1이 아닌 경우 그대로 사용
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return hostname;
  }
  
  // localhost인 경우 현재 PC의 IP 주소 사용
  return '192.168.45.152';
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 12px 24px rgba(0,0,0,0.12);
  color: #2c3e50;
`;

const Title = styled.h2`
  margin: 0 0 10px 0;
  color: #2c3e50;
`;

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
`;

const Input = styled.input`
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #bdc3c7;
  background: white;
  color: #2c3e50;
`;

const Button = styled.button`
  padding: 10px 16px;
  border-radius: 10px;
  border: none;
  background: #3498db;
  color: white;
  cursor: pointer;
  font-weight: 600;
`;

const DangerButton = styled(Button)`
  background: #e74c3c;
`;

const Muted = styled.div`
  color: #7f8c8d;
  font-size: 14px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 12px;
`;

const RoomCard = styled(Card)`
  border: 1px solid rgba(0,0,0,0.06);
`;

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [rooms, setRooms] = useState({});
  const [newRoomId, setNewRoomId] = useState('');
  const [message, setMessage] = useState('');

  const headers = token ? { 'x-admin-token': token } : {};

  const login = async () => {
    setMessage('');
    try {
      const res = await axios.post(`http://${window.location.hostname}:3001/api/admin/login`, { password });
      if (res.data.success) {
        localStorage.setItem('adminToken', res.data.token);
        setToken(res.data.token);
        setPassword('');
      }
    } catch (e) {
      setMessage('로그인 실패: 비밀번호를 확인하세요.');
    }
  };

  const changePassword = async () => {
    setMessage('');
    try {
      const res = await axios.post(`http://${window.location.hostname}:3001/api/admin/password`, { newPassword }, { headers });
      if (res.data.success) {
        setMessage('비밀번호가 변경되었습니다.');
        setNewPassword('');
      }
    } catch (e) {
      setMessage('비밀번호 변경 실패.');
    }
  };

  const loadRooms = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`http://${window.location.hostname}:3001/api/admin/rooms`, { headers });
      if (res.data.success) {
        setRooms(res.data.rooms);
      }
    } catch (e) {
      setMessage('방 목록을 불러오지 못했습니다.');
    }
  }, [token]);

  useEffect(() => {
    loadRooms();
    const i = setInterval(loadRooms, 4000);
    return () => clearInterval(i);
  }, [loadRooms]);

  const createRoom = async () => {
    setMessage('');
    if (!/^\d+$/.test(newRoomId)) {
      setMessage('방 번호는 숫자만 입력하세요.');
      return;
    }
    try {
      const res = await axios.post(`http://${window.location.hostname}:3001/api/admin/rooms`, { roomId: newRoomId }, { headers });
      if (res.data.success) {
        setNewRoomId('');
        loadRooms();
      }
    } catch (e) {
      setMessage(e.response?.data?.message || '방 생성 실패');
    }
  };

  const deleteRoom = async (roomId) => {
    setMessage('');
    try {
      const res = await axios.delete(`http://${window.location.hostname}:3001/api/admin/rooms/${roomId}`, { headers });
      if (res.data.success) {
        loadRooms();
      }
    } catch (e) {
      setMessage('방 삭제 실패');
    }
  };

  if (!token) {
    return (
      <div className="card">
        <Wrapper>
          <Title>관리자 로그인</Title>
          <Row>
            <Input type="password" placeholder="비밀번호 (초기값 0000)" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button onClick={login}>로그인</Button>
          </Row>
          {message && <Muted style={{ color: '#e74c3c' }}>{message}</Muted>}
        </Wrapper>
      </div>
    );
  }

  const entries = Object.entries(rooms);

  return (
    <div className="card">
      <Wrapper>
        <Title>관리자 대시보드</Title>

        <Card>
          <Title>비밀번호 변경</Title>
          <Row>
            <Input type="password" placeholder="새 비밀번호" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <Button onClick={changePassword}>변경</Button>
          </Row>
        </Card>

        <Card>
          <Title>새 방 만들기</Title>
          <Row>
            <Input placeholder="방 번호 (숫자만)" value={newRoomId} onChange={(e) => setNewRoomId(e.target.value)} />
            <Button onClick={createRoom}>방 만들기</Button>
          </Row>
        </Card>

        <Card>
          <Title>방 목록</Title>
          {entries.length === 0 ? (
            <Muted>아직 생성된 방이 없습니다.</Muted>
          ) : (
            <Grid>
              {entries.map(([roomId, room]) => (
                <RoomCard key={roomId}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>방 {roomId}</div>
                      <Muted>참가자 {room.participants.length}명</Muted>
                    </div>
                    <DangerButton onClick={() => deleteRoom(roomId)}>삭제</DangerButton>
                  </div>
                  <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center' }}>
                    <QRCode value={`http://${getCurrentIP()}:3000/room/${roomId}`} size={140} />
                  </div>
                </RoomCard>
              ))}
            </Grid>
          )}
        </Card>

        {message && <Muted style={{ color: '#e74c3c' }}>{message}</Muted>}
      </Wrapper>
    </div>
  );
}
